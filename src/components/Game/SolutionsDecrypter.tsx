"use client";
import { ComponentProps, ComponentType, useEffect } from "react";
import { useState } from "react";
import { decryptSolutions } from "./encryptSolutions";
import { EncryptedData } from "@/lib/encryption";

type SolutionsProps = { solutions: string[] | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecrypterForwardProps<TComponent extends ComponentType<any>> = Omit<
  ComponentProps<TComponent>,
  keyof SolutionsProps
>;

export const wrapWithSolutionsDecrypter =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <ChildComponentType extends ComponentType<any>>(
    ChildComponent: ChildComponentType,
  ) => {
    const DecryptedChild = ({
      solutionsEncrypted,
      ...forwardProps
    }: {
      solutionsEncrypted: EncryptedData;
    } & DecrypterForwardProps<ChildComponentType>) => (
      <SolutionsDecrypter
        solutionsEncrypted={solutionsEncrypted}
        ChildComponent={ChildComponent}
        forwardProps={forwardProps}
      />
    );
    return DecryptedChild;
  };

export const SolutionsDecrypter = <
  TChildComponentProps extends SolutionsProps,
>({
  solutionsEncrypted,
  ChildComponent,
  forwardProps,
}: {
  solutionsEncrypted: EncryptedData;
  ChildComponent: ComponentType<TChildComponentProps>;
  forwardProps: DecrypterForwardProps<ComponentType<TChildComponentProps>>;
}) => {
  const [solutions, setSolutions] = useState<string[] | null>(null);

  useEffect(() => {
    const decrypt = async () => {
      const solutions = await decryptSolutions(
        solutionsEncrypted.encryptedData,
        solutionsEncrypted.initVector,
      );
      setSolutions(solutions);
    };
    decrypt();
  }, [solutionsEncrypted]);

  return (
    <ChildComponent
      {...(forwardProps as TChildComponentProps)}
      solutions={solutions}
    />
  );
};
