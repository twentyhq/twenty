import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { DropdownPageRegistrationEffect } from './DropdownPageRegistrationEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();

  return (
    <>
      {context.pageId === id && (
        <DropdownContext.Provider
          value={{ ...context, type: type ?? context.type }}
        >
          {children}
        </DropdownContext.Provider>
      )}
      <DropdownPageRegistrationEffect id={id} type={type} />
    </>
  );
};
