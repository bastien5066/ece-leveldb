import { LevelDB } from './leveldb'
import WriteStream from 'level-ws'


export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  private db: any
  private filter: any

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public save(key: number, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })
    stream.end()
  }

  public setFilter(filter: string, callback: (error: Error | null, result: string | null) => void) {
    this.db.filter = filter;
    callback(null, this.db.filter)
  }

  public getAll(key: number, callback: (error: Error | null, result: Metric[] | null) => void) {
    // Read
    let metrics: Metric[] = [];
    let filter = this.db.filter;
    this.db.createReadStream()
      .on('data', function (data) {
        let id = data.key.split(':')[1]
        if (id == key) {
          let timestamp: string = data.key.split(':')[2]
          let oneMetric: Metric = new Metric(timestamp, data.value)
          if (filter === "") {
            metrics.push(oneMetric)
          } else {
            if (timestamp.includes(filter)) {
              metrics.push(oneMetric)
            } else {
              //nothing
            }
          }
        }
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
        callback(err, null)
      })
      .on('close', function () {
        console.log('Stream closed')
        callback(null, metrics)
      })
      .on('end', function () {
        console.log('Stream ended')
      })
  }

  public delete(key: number, name: string, callback: (error: Error | null, result: string | null) => void) {
    let id = "metric:" + name + ":" + key;
    let notfound = false
    this.db.get(id, function (err) {
      if (err) {
        if (err.notFound) {
          // handle a 'NotFoundError' here
          notfound = true
        }
      }
    })
    this.db.del(id, function (err) {
      if (err || notfound) {
        // I/O or other error, pass it up the callback chain
        return callback(err, null)
      }
      return callback(null, id)
    });

  }
}