import redis from 'redis'
import { promisify } from 'util'
import { config } from '../config'

class CacheService {
  private client: redis.RedisClient
  private getAsync: (key: string) => Promise<string | null>
  private setAsync: (key: string, value: string, mode: string, duration: number) => Promise<unknown>
  private delAsync: (key: string) => Promise<number>

  constructor() {
    this.client = redis.createClient({
      host: config.redis.host,
      port: config.redis.port,
    })
    this.getAsync = promisify(this.client.get).bind(this.client)
    this.setAsync = promisify(this.client.set).bind(this.client)
    this.delAsync = promisify(this.client.del).bind(this.client)
  }

  async get(key: string) {
    return this.getAsync(key)
  }

  async set(key: string, value: string, ttlSeconds = 600) {
    return this.setAsync(key, value, 'EX', ttlSeconds)
  }

  async del(key: string) {
    return this.delAsync(key)
  }

  async delPattern(pattern: string) {
    return new Promise((resolve, reject) => {
      this.client.keys(pattern, (err, keys) => {
        if (err) return reject(err)
        if (keys.length === 0) return resolve(0)
        this.client.del(keys, (err2, count) => {
          if (err2) return reject(err2)
          resolve(count)
        })
      })
    })
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', resolve)
      this.client.on('error', reject)
    })
  }
}

export const cacheService = new CacheService()