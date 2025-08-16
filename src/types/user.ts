export interface User {
  id: number;
  email: string;
  name: string;
  profile_image: string | null;
  provider: string;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface UserAgreements {
  service_terms: boolean;
  age_verification: boolean;
  privacy_policy: boolean;
  marketing: boolean;
  all_required_agreed: boolean;
  versions: {
    service: string;
    privacy: string;
    marketing: string;
  };
}

export interface SocialUser extends User {
  agreements: UserAgreements;
  needs_terms_update: boolean;
}

export interface SocialLoginResponse {
  user: SocialUser;
  access: string;
  refresh: string;
  is_new: boolean;
  status: string;
  message: string;
  user_id: number;
  user_info: SocialUser;
}

export interface SocialTermsAgreementResponse {
  message: string;
  user: SocialUser;
  access: string;
  refresh: string;
}
