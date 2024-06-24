import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import { debounce } from 'lodash'

export function md5(value: string) {
  return createHash('md5').update(value).digest('hex')
}

export const cachePath = path.resolve(
  os.homedir(),
  os.platform() === 'darwin' ? '.lxec-frd-toolkid' : 'cache-lxec-frd-toolkid',
)
fs.ensureDirSync(cachePath)

/**
 * 用于存储数据的缓存。
 */
export class Cache {
  confPath = path.join(cachePath, 'config.json')

  /**
   * url => md5(url)
   */
  conf!: Record<string, string>

  /**
   * 从磁盘加载缓存数据。
   * @returns 加载的缓存数据。
   */
  async load() {
    await fs.ensureDir(cachePath)

    if (!this.conf) {
      this.conf = {}

      try {
        this.conf = await fs.readJson(this.confPath)
      }
      catch (error) {
        this.conf = {}
      }
    }

    this.save()
    return this.conf
  }

  save = debounce(() => this.saveSync(), 200)

  /**
   * 将缓存数据保存到磁盘。
   */
  saveSync(): void {
    fs.writeFileSync(this.confPath, JSON.stringify(this.conf))
  }

  /**
   * 检查缓存是否包含指定id的数据。
   * @param id - 要检查的id。
   * @returns 如果缓存包含id的数据，则返回`true`，否则返回`false`。
   */
  has(id: string) {
    return !!this.conf[id]
  }

  /**
   * 从缓存中检索指定的数据。
   * @param id - 要检索数据的id。
   * @returns 缓存的数据，如果缓存中不存在，则返回`undefined`。
   */
  async get(id: string) {
    const hash = this.conf[id]
    if (!hash)
      return

    const p = path.join(cachePath, hash)
    if (!(await fs.pathExists(p)))
      return

    const res = await fs.readJSON(p)

    return res
  }

  /**
   * 将指定 id 的数据设置到缓存中。
   * @param id - 要设置数据的id。
   * @param value - 要设置的数据。
   */
  async set(id: string, value: string) {
    if (this.conf[id]) {
      const p = path.join(cachePath, this.conf[id])
      if (await fs.pathExists(p))
        await fs.unlink(p)
    }

    const hash = md5(value)

    this.conf[id] = hash

    await fs.writeFile(path.join(cachePath, hash), value)
    this.save()
  }

  /**
   * 清除缓存，删除所有存储的数据。
   */
  async clear() {
    this.conf = {}
    await fs.emptyDir(cachePath)
  }
}
