import { Control, FieldValues, Path } from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  errors?: string;
  inputMode?: any;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
};

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  errors,
  ...rest
}: Props<T>) {
  return null; // your UI here
}