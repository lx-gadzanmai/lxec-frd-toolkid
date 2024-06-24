/**
 * 转换Promise的返回值和错误
 * @param promise - 要转换的Promise
 * @param errorExt - 错误扩展信息（可选）
 * @returns 一个包含两个元素的Promise，第一个元素是错误对象，第二个元素是数据结果
 */
export async function to<T, U = Error>(
  promise: Promise<T>,
  errorExt?: any,
): Promise<[U, undefined] | [null, T]> {
  try {
    const data = await promise
    const result: [null, T] = [null, data]
    return result
  }
  catch (err) {
    if (errorExt) {
      const parsedError = Object.assign({}, err, errorExt)
      return [parsedError, undefined]
    }
    const result_1: [U, undefined] = [err as U, undefined]
    return result_1
  }
}
