export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          name: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          user_id: string;
          name: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          user_id?: string;
          name?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          column_id: string;
          user_id: string;
          title: string;
          description: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          column_id: string;
          user_id: string;
          title: string;
          description?: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          column_id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          title: string;
          is_completed: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          title: string;
          is_completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          title?: string;
          is_completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type BoardRow = Database["public"]["Tables"]["boards"]["Row"];
export type ColumnRow = Database["public"]["Tables"]["columns"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type SubtaskRow = Database["public"]["Tables"]["subtasks"]["Row"];

export type ColumnWithTasks = ColumnRow & {
  tasks: (TaskRow & { subtasks: SubtaskRow[] })[];
};

export type BoardWithColumns = BoardRow & {
  columns: ColumnWithTasks[];
};
