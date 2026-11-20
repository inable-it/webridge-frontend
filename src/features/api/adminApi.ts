import { adminApi } from '@/app/api';
import type { AccessibilityScanDetail } from '@/features/api/scanApi';

// ── 공통 / 인증 타입 ─────────────────────────────────────────
export type AdminUser = {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
};

export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  access_token: string;
  token_type: string;
  user: AdminUser;
};

// ── (1) 대시보드 타입 ───────────────────────────────────────
export type DailyCount = {
  date: string;
  count: number;
};

export type AdminDashboardRecentScan = {
  id: string;
  url: string;
  title: string;
  compliance_score: number;
  status: string;
  user_email?: string;
  requester_email?: string;
  created_at?: string;
};

export type AdminDashboardRecentUser = {
  id: number;
  email: string;
  name: string;
  provider?: string;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
};

export type AdminDashboardResponse = {
  total_users: number;
  today_new_users: number;
  active_users: number;
  admin_users: number;
  total_scans: number;
  today_scans: number;
  completed_scans: number;
  failed_scans: number;
  average_compliance_score: number;
  daily_new_users: DailyCount[];
  daily_scans: DailyCount[];
  recent_scans: AdminDashboardRecentScan[];
  recent_users: AdminDashboardRecentUser[];
};

// ── (2) 회원 관리 타입 ──────────────────────────────────────
export type AdminUserItem = {
  id: number;
  email: string;
  name: string;
  provider: string;
  is_active: boolean;
  is_admin: boolean;
  path_to_webridge_label?: string | null;
  occupation_label?: string | null;
  created_at: string;
  scan_count: number;
};

export type AdminUsersListParams = {
  page?: number;
  size?: number;
  search?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  provider?: string;
};

export type AdminUsersListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUserItem[];
};

export type AdminUserDetailResponse = {
  id: number;
  email: string;
  name: string;
  provider: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string | null;
  scan_count?: number;
  terms_agreements?: Array<{
    type: string;
    version?: string;
    agreed: boolean;
    agreed_at?: string | null;
  }>;
  extra_info?: {
    path_to_webridge?: string;
    path_to_webridge_label?: string;
    path_to_webridge_other?: string;
    occupation?: string;
    occupation_label?: string;
    occupation_other?: string;
  } | null;
  recent_scans?: Array<{
    id: string;
    url: string;
    title: string;
    status: string;
    compliance_score: number;
    total_issues: number;
    created_at: string;
  }>;
};

// ── (3) 검사 내역 관리 타입 ─────────────────────────────────
export type AdminScanItem = {
  id: string;
  url: string;
  title: string;
  compliance_score: number;
  total_issues: number;
  status: string;
  user_email?: string;
  requester_email?: string;
  created_at: string;
  completed_at?: string | null;
};

export type AdminScansListParams = {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
};

export type AdminScansListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminScanItem[];
};

// ── (4) 약관 관리 타입 ──────────────────────────────────────
export type AdminTermItem = {
  id: number;
  type: string;
  version: string;
  change_type: string;
  requires_reagreement: boolean;
  change_summary: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AdminTermPayload = {
  type: string;
  version: string;
  change_type: string;
  requires_reagreement: boolean;
  change_summary: string;
  content: string;
  is_active: boolean;
};

// ── (5) 가입 설문 통계 타입 ─────────────────────────────────
export type SurveyStatItem = {
  code: string;
  label: string;
  count: number;
  percentage: number;
};

export type AdminSignupSurveyStatsResponse = {
  total_responses: number;
  path_to_webridge_stats: SurveyStatItem[];
  occupation_stats: SurveyStatItem[];
};

// ── API Endpoints ───────────────────────────────────────────
export const adminEndpointsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    // (0) 관리자 로그인
    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (body) => ({
        url: '/admin/login',
        method: 'POST',
        body,
      }),
    }),

    // (1) 대시보드
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => ({ url: '/admin/dashboard' }),
      providesTags: ['AdminDashboard'],
    }),

    // (2) 회원 관리
    getAdminUsers: builder.query<AdminUsersListResponse, AdminUsersListParams>({
      query: ({ page = 1, size = 20, search, isAdmin, isActive, provider } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
        });
        if (search && search.trim()) params.append('search', search.trim());
        if (typeof isAdmin === 'boolean') params.append('isAdmin', String(isAdmin));
        if (typeof isActive === 'boolean') params.append('isActive', String(isActive));
        if (provider) params.append('provider', provider);
        return { url: `/admin/users?${params.toString()}` };
      },
      providesTags: ['AdminUsers'],
    }),

    getAdminUserDetail: builder.query<AdminUserDetailResponse, number>({
      query: (userId) => ({ url: `/admin/users/${userId}` }),
      providesTags: (_res, _err, userId) => [{ type: 'AdminUserDetail', id: userId }],
    }),

    updateAdminUserStatus: builder.mutation<
      void,
      { userId: number; is_active: boolean }
    >({
      query: ({ userId, is_active }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (_res, _err, { userId }) => [
        'AdminUsers',
        'AdminDashboard',
        { type: 'AdminUserDetail', id: userId },
      ],
    }),

    updateAdminUserRole: builder.mutation<
      void,
      { userId: number; is_admin: boolean }
    >({
      query: ({ userId, is_admin }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { is_admin },
      }),
      invalidatesTags: (_res, _err, { userId }) => [
        'AdminUsers',
        'AdminDashboard',
        { type: 'AdminUserDetail', id: userId },
      ],
    }),

    // (3) 검사 내역 관리
    getAdminScans: builder.query<AdminScansListResponse, AdminScansListParams>({
      query: ({ page = 1, size = 20, search, status } = {}) => {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
        });
        if (search && search.trim()) params.append('search', search.trim());
        if (status) params.append('status', status);
        return { url: `/admin/scans?${params.toString()}` };
      },
      providesTags: ['AdminScans'],
    }),

    getAdminScanDetail: builder.query<AccessibilityScanDetail, string>({
      query: (scanId) => ({ url: `/admin/scans/${scanId}` }),
      providesTags: (_res, _err, scanId) => [{ type: 'AdminScanDetail', id: scanId }],
    }),

    deleteAdminScan: builder.mutation<void, string>({
      query: (scanId) => ({
        url: `/admin/scans/${scanId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminScans', 'AdminDashboard'],
    }),

    // (4) 약관 관리
    getAdminTerms: builder.query<AdminTermItem[], void>({
      query: () => ({ url: '/admin/terms' }),
      providesTags: ['AdminTerms'],
    }),

    getAdminTermDetail: builder.query<AdminTermItem, number>({
      query: (termsId) => ({ url: `/admin/terms/${termsId}` }),
    }),

    createAdminTerm: builder.mutation<AdminTermItem, AdminTermPayload>({
      query: (body) => ({
        url: '/admin/terms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminTerms'],
    }),

    updateAdminTerm: builder.mutation<
      AdminTermItem,
      { termsId: number; data: AdminTermPayload }
    >({
      query: ({ termsId, data }) => ({
        url: `/admin/terms/${termsId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AdminTerms'],
    }),

    // (5) 가입 설문 통계
    getAdminSignupSurveys: builder.query<AdminSignupSurveyStatsResponse, void>({
      query: () => ({ url: '/admin/surveys/signup' }),
      providesTags: ['AdminSurveys'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminLoginMutation,
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminUserRoleMutation,
  useGetAdminScansQuery,
  useGetAdminScanDetailQuery,
  useDeleteAdminScanMutation,
  useGetAdminTermsQuery,
  useGetAdminTermDetailQuery,
  useCreateAdminTermMutation,
  useUpdateAdminTermMutation,
  useGetAdminSignupSurveysQuery,
} = adminEndpointsApi;
