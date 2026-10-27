

export interface CodeTab {

  id: string;

  label: string;

  code: string;

  language?: "vue" | "ts" | "bash" | "text";
}
