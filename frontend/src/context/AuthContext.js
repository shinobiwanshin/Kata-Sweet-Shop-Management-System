import React, { createContext, useContext, useEffect } from "react";
import {
  useUser,
  useAuth as useClerkAuth,
  useOrganization,
  useOrganizationList,
} from "@clerk/clerk-react";
import { setClerkTokenGetter } from "../api/axios";

const AuthContext = createContext(null);

// Helper to determine if user is admin based on org membership
const isOrgAdmin = (orgRole) => {
  if (!orgRole) return false;
  const role = orgRole.toLowerCase();
  return role === "admin" || role === "org:admin" || role === "owner";
};

// This is a compatibility layer to maintain the existing API
export const AuthProvider = ({ children }) => {
  const { user } = useUser();
  const { signOut, getToken, orgId } = useClerkAuth();
  const { membership } = useOrganization();
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  // Auto-select the first organization if user has one but none is active
  useEffect(() => {
    if (user && !orgId && userMemberships?.data?.length > 0 && setActive) {
      // Find an admin membership if possible, otherwise use first
      const adminMembership = userMemberships.data.find((m) =>
        isOrgAdmin(m.role)
      );
      const targetMembership = adminMembership || userMemberships.data[0];
      setActive({ organization: targetMembership.organization.id });
    }
  }, [user, orgId, userMemberships, setActive]);

  // Set up Clerk token getter for axios - include orgId to get org claims in JWT
  useEffect(() => {
    const getOrgToken = async () => {
      // If user is in an org, get token with org context so org_role is included
      if (orgId) {
        return await getToken({ organizationId: orgId });
      }
      return await getToken();
    };
    setClerkTokenGetter(getOrgToken);
  }, [getToken, orgId]);

  const login = async (email, password) => {
    // Clerk handles login through its components
    throw new Error("Use Clerk components for authentication");
  };

  const register = async (email, password, role) => {
    // Clerk handles registration through its components
    throw new Error("Use Clerk components for authentication");
  };

  const logout = async () => {
    await signOut();
  };

  const getAuthToken = async () => {
    return await getToken();
  };

  // Derive role: check publicMetadata first, then current org membership, then any org membership
  const derivedRole = (() => {
    if (!user) return "USER";
    // 1. Check publicMetadata.role (set manually in Clerk dashboard)
    if (user.publicMetadata?.role) {
      return user.publicMetadata.role.toUpperCase();
    }
    // 2. Check current active organization membership role
    if (membership?.role && isOrgAdmin(membership.role)) {
      return "ADMIN";
    }
    // 3. Check any organization membership for admin role
    if (user.organizationMemberships?.length > 0) {
      for (const m of user.organizationMemberships) {
        if (isOrgAdmin(m.role)) {
          return "ADMIN";
        }
      }
    }
    return "USER";
  })();

  const value = {
    user: user
      ? {
          email: user.primaryEmailAddress?.emailAddress,
          role: derivedRole,
          clerkId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          orgRole: membership?.role, // expose raw org role for debugging
        }
      : null,
    login,
    register,
    logout,
    getAuthToken,
    loading: false, // Clerk handles loading internally
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
