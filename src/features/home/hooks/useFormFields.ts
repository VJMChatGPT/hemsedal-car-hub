import { ChangeEvent, useState } from "react";

export const useFormFields = <T extends Record<string, string>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  const onFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const resetValues = () => setValues(initialValues);

  return {
    values,
    setValues,
    onFieldChange,
    resetValues,
  };
};
