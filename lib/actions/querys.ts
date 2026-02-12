import { createClient } from "../supabase/client";

export type QueryFormState = {
  message: string;
};

const INITIAL_STATE: QueryFormState = { message: "" };

export async function insertQuery(
  prevState: typeof INITIAL_STATE,
  formData: FormData,
): Promise<any> {
  const fields = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const supabase = createClient();
  const error = await supabase
    .from("test")
    .insert({ name: `${fields.name}`, description: `${fields.description}` });
}
