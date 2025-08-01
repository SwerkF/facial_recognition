export type Serialize<T extends object> = {
    [P in keyof T]: T[P] extends Date ? string : T[P] extends object ? Serialize<T[P]> : T[P];
};
