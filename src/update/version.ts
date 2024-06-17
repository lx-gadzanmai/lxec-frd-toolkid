import axios from 'axios'
import { to } from './tools'

export async function fetchLastVersion() {
  const eventId = 'EVE202406172659029'
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
    return JSON.parse(resultRows.data || '{}')?.config?.lxec_frd_toolkid ?? {}
  }
}
