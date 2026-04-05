// API Configuration Constants

const PROD_SERVER = 'https://api.umuhinzilink.echo-solution.com';
const DEV_SERVER = 'http://localhost:5000'

export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development' ? DEV_SERVER : PROD_SERVER,
  API_VERSION: '', // No versioning for this backend
  TIMEOUT: 20000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/login/google',
    REGISTER: '/auth/register',
    REGISTER_FARMER: '/auth/register/farmer',
    REGISTER_SUPPLIER: '/auth/register/supplier',
    REGISTER_BUYER: '/auth/register/buyer',
    REGISTER_GOOGLE_USER: '/auth/register/google',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_USER: '/auth/check-token',
    FORGOT_PASSWORD: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    CHECK_OTP: '/auth/verify-otp',
    CHECK_RESET_CODE: '/auth/verify-reset-code',
    ASK_OTP_CODE: '/auth/ask-otp-code',
  },
  
  JOB: {
    ALL: '/jobs',
    BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: '/jobs',
    CANDIDATES: (jobId: string) => `/jobs/${jobId}/candidates`,
    SCREEN: (jobId: string) => `/jobs/${jobId}/screen`,
    CANDIDATE_BY_ID: (id: string) => `/candidates/${id}`
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};



export const SOCKET_EVENTS = {
  MESSAGE: {
    SEND_MESSAGE: '/app/chat.sendMessage',
    REPLY_MESSAGE: '/app/chat.sendMessageReply',
    REACT_MESSAGE: '/app/chat.sendMessageReaction',
    EDIT_MESSAGE: '/app/chat.editMessage',
    DELETE_MESSAGE: '/app/chat.deleteMessage',
    TYPING: '/app/chat.typing'
  },
  NEGOTIATION: {
    SUBSCRIBE_NEGOTIATION: '/topic/negotiation',
    SUBSCRIBE_MESSAGE: '/topic/negotiation/{negotiationId}',
    SUBSCRIBE_STATUS: '/queue/negotiationAccepted',
    SUBSCRIBE_REJECTED: '/queue/negotiationRejected'
  }
};