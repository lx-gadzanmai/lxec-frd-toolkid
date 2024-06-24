import axios from 'axios'
import { to } from '../tools'
import { Cache } from '../cache'

export const apiCache = new Cache()

export async function fetchSnippets(eventId: string, cache = true) {
  if (cache && apiCache.has(eventId)) {
    const data = await apiCache.get(eventId)
    return data
  }

  const [err, res] = await to(axios.post(
    'https://paya.fenqile.com/route0002/eventMall/queryManualConfig.json',
    {
      data: {
        eventId,
      },
    },
  ),
  )
  if (!err && +res?.data?.result === 0) {
    const resultRows = res.data?.data?.result_rows ?? {}
    const config = JSON.parse(resultRows.data || '{}')?.config
    const output = config ?? {}
    config && apiCache.set(eventId, JSON.stringify(config))
    return output
  }
}
