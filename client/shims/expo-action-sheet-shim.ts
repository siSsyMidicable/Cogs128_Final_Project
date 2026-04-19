export function useActionSheet() {
  return {
    showActionSheetWithOptions: (options: any, callback: (index?: number) => void) => {
      if (typeof callback === 'function') callback(0);
    },
  };
}
export default { useActionSheet };
