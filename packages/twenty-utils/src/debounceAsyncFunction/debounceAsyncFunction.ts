export function debounceAsyncFunction<T extends (...args: any[]) => Promise<any>>(fn: T, delayMs = 200) {
  let timer: any = null;
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timer);
      timer = setTimeout(() => { fn(...args).then(resolve).catch(reject); }, delayMs);
    });
  };
}