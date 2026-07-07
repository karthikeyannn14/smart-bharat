export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  mobile: string;
  createdAt: string;
}

// Simulated password storage (separate from profile to not store passwords in the public users collection)
interface UserCredentials {
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

const PASSWORD_KEY = "sb_user_credentials";
const USERS_COLLECTION_KEY = "sb_users_collection";
const CURRENT_USER_KEY = "sb_current_user";

// DJB2 Hash function to simulate secure password hashing (No plain text passwords)
const hashPassword = (password: string): string => {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

export const AuthService = {
  // Check if there is an active session
  getCurrentUser(): UserProfile | null {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  // Initialize seed user if database is empty
  initSeedUser() {
    const credentials = localStorage.getItem(PASSWORD_KEY);
    if (!credentials) {
      const seedProfile: UserProfile = {
        uid: "uid-seed-citizen",
        fullName: "Bharat Citizen",
        email: "demo@smartbharat.gov.in",
        mobile: "9876543210",
        createdAt: new Date().toISOString()
      };

      const seedCred: UserCredentials = {
        email: "demo@smartbharat.gov.in",
        passwordHash: hashPassword("Password123!"),
        profile: seedProfile
      };

      localStorage.setItem(PASSWORD_KEY, JSON.stringify([seedCred]));
      localStorage.setItem(USERS_COLLECTION_KEY, JSON.stringify([seedProfile]));
    }
  },

  // Get all users in the "users" collection
  getUsersCollection(): UserProfile[] {
    const saved = localStorage.getItem(USERS_COLLECTION_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  // Sign up a new user
  signUp(fullName: string, email: string, mobile: string, password: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const normEmail = email.trim().toLowerCase();
          
          // Load credentials database
          const credsJSON = localStorage.getItem(PASSWORD_KEY);
          const creds: UserCredentials[] = credsJSON ? JSON.parse(credsJSON) : [];
          
          // Check for duplicate email
          const exists = creds.some(c => c.email === normEmail);
          if (exists) {
            reject(new Error("This email is already registered."));
            return;
          }

          // Create unique uid
          const uid = "uid-" + Math.random().toString(36).substr(2, 9);
          const createdAt = new Date().toISOString();

          const profile: UserProfile = {
            uid,
            fullName: fullName.trim(),
            email: normEmail,
            mobile: mobile.trim(),
            createdAt
          };

          const newCred: UserCredentials = {
            email: normEmail,
            passwordHash: hashPassword(password),
            profile
          };

          // Save to simulated databases
          creds.push(newCred);
          localStorage.setItem(PASSWORD_KEY, JSON.stringify(creds));

          const users = this.getUsersCollection();
          users.push(profile);
          localStorage.setItem(USERS_COLLECTION_KEY, JSON.stringify(users));

          // Set current session
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
          localStorage.setItem("sb_isLoggedIn", "true");
          localStorage.setItem("sb_userName", profile.fullName);

          resolve(profile);
        } catch (e: any) {
          reject(new Error("An error occurred during sign up. Please try again."));
        }
      }, 1000); // Realistic network delay
    });
  },

  // Login with Email & Password
  login(email: string, password: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const normEmail = email.trim().toLowerCase();
          const pHash = hashPassword(password);

          // Load credentials database
          const credsJSON = localStorage.getItem(PASSWORD_KEY);
          const creds: UserCredentials[] = credsJSON ? JSON.parse(credsJSON) : [];

          const match = creds.find(c => c.email === normEmail);
          if (!match) {
            reject(new Error("No account found with this email. Please register."));
            return;
          }

          if (match.passwordHash !== pHash) {
            reject(new Error("Invalid password. Please try again."));
            return;
          }

          // Set current session
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match.profile));
          localStorage.setItem("sb_isLoggedIn", "true");
          localStorage.setItem("sb_userName", match.profile.fullName);

          resolve(match.profile);
        } catch (e: any) {
          reject(new Error("An error occurred during login. Please try again."));
        }
      }, 1000); // Realistic network delay
    });
  },

  // Google sign-in
  loginWithGoogle(email: string, fullName: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const normEmail = email.trim().toLowerCase();
          
          // Check if user already exists
          const credsJSON = localStorage.getItem(PASSWORD_KEY);
          const creds: UserCredentials[] = credsJSON ? JSON.parse(credsJSON) : [];
          
          let profile: UserProfile;
          const match = creds.find(c => c.email === normEmail);
          
          if (match) {
            profile = match.profile;
          } else {
            // Register them automatically via Google
            const uid = "uid-google-" + Math.random().toString(36).substr(2, 9);
            const createdAt = new Date().toISOString();
            
            profile = {
              uid,
              fullName: fullName.trim(),
              email: normEmail,
              mobile: "Not Provided",
              createdAt
            };

            const newCred: UserCredentials = {
              email: normEmail,
              passwordHash: "google-authenticated-session",
              profile
            };

            creds.push(newCred);
            localStorage.setItem(PASSWORD_KEY, JSON.stringify(creds));

            const users = this.getUsersCollection();
            users.push(profile);
            localStorage.setItem(USERS_COLLECTION_KEY, JSON.stringify(users));
          }

          // Set session
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
          localStorage.setItem("sb_isLoggedIn", "true");
          localStorage.setItem("sb_userName", profile.fullName);

          resolve(profile);
        } catch (e: any) {
          reject(new Error("Google authentication failed."));
        }
      }, 800);
    });
  },

  // Forgot password mock
  resetPassword(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normEmail = email.trim().toLowerCase();
        const credsJSON = localStorage.getItem(PASSWORD_KEY);
        const creds: UserCredentials[] = credsJSON ? JSON.parse(credsJSON) : [];

        const match = creds.find(c => c.email === normEmail);
        if (!match) {
          reject(new Error("No registered citizen account found with this email."));
          return;
        }

        resolve("Reset instructions sent successfully.");
      }, 1000);
    });
  },

  // Logout session
  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("sb_isLoggedIn");
    localStorage.removeItem("sb_userName");
    // Clear other cached user-specific data from localStorage to ensure clean logout
    localStorage.removeItem("sb_documents");
    localStorage.removeItem("sb_complaints");
    localStorage.removeItem("sb_chatMessages");
  }
};
