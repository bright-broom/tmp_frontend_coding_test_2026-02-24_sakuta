export * from './building';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredPick<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialPick<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
export type Awaited<T> = T extends Promise<infer U> ? U : T;

export type Parameters<T extends (...args: never[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

export type ReturnType<T extends (...args: never[]) => unknown> = T extends (
  ...args: never[]
) => infer R
  ? R
  : never;

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export type BaseProps = WithClassName;
export type ContainerProps = WithChildren & WithClassName;

export type ClickHandler<T = void> = (event: React.MouseEvent<HTMLElement>) => T;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState<T extends string = string> {
  field: T;
  direction: 'asc' | 'desc';
}
