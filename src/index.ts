export { Octonomy } from "./client";
export type { OctonomyConfig } from "./client";

export type { RequestOptions } from "./transport";
export type { ListOptions, Page, Pagination } from "./pagination";

export {
  ApiError,
  AuthenticationError,
  ConflictError,
  ErrorCode,
  ForbiddenError,
  isApiError,
  NotFoundError,
  OctonomyConfigError,
  OctonomyError,
  OctonomyTransportError,
  ValidationError,
} from "./errors";
export type { ApiErrorFields, ErrorCodeValue } from "./errors";

export { VocabularyService } from "./resources/vocabularies";
export type {
  Vocabulary,
  VocabularyCreateParams,
  VocabularyListParams,
  VocabularyUpdateParams,
} from "./resources/vocabularies";

export { TagService } from "./resources/tags";
export type {
  Tag,
  TagCreateParams,
  TagListParams,
  TagUpdateParams,
} from "./resources/tags";

export { VERSION } from "./version";
