import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  subjects?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  subjects?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // todo: remove mock functionality - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock login - check for admin
    if (email === "admin@edu.com" && password === "admin123") {
      const adminUser: User = {
        id: "admin-1",
        username: "admin",
        email: "admin@edu.com",
        role: "admin",
        name: "Administrator",
      };
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
    } else if (email.includes("teacher")) {
      const teacherUser: User = {
        id: "teacher-1",
        username: "teacher",
        email,
        role: "teacher",
        name: "Dr. John Smith",
        department: "Computer Science",
        subjects: ["Web Technology", "Database Systems"],
      };
      setUser(teacherUser);
      localStorage.setItem("user", JSON.stringify(teacherUser));
    } else {
      const studentUser: User = {
        id: "student-1",
        username: "student",
        email,
        role: "student",
        name: "Alex Johnson",
      };
      setUser(studentUser);
      localStorage.setItem("user", JSON.stringify(studentUser));
    }
    setIsLoading(false);
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    // todo: remove mock functionality - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `${data.role}-${Date.now()}`,
      username: data.email.split("@")[0],
      email: data.email,
      role: data.role,
      name: data.name,
      department: data.department,
      subjects: data.subjects,
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
