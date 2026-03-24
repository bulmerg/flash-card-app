// Keep this list small and high-confidence. Add aliases from real missed answers.
export const SYNONYM_GROUPS = [
  { canonical: 'latency', aliases: ['response time', 'delay', 'lag'] },
  { canonical: 'throughput', aliases: ['qps', 'rps', 'requests per second'] },
  { canonical: 'availability', aliases: ['uptime', 'high availability', 'ha'] },
  { canonical: 'consistency', aliases: ['strong consistency', 'linearizability'] },
  { canonical: 'partition', aliases: ['network partition', 'split brain'] },
  { canonical: 'contention', aliases: ['lock contention', 'hot key', 'hot row'] },
  { canonical: 'cache', aliases: ['caching', 'memoization'] },
  { canonical: 'index', aliases: ['indexing', 'indexes', 'indices'] },
  { canonical: 'replication', aliases: ['replica', 'read replica', 'followers'] },
  { canonical: 'sharding', aliases: ['partitioning', 'horizontal partitioning'] },
  { canonical: 'idempotent', aliases: ['idempotency', 'safe retries', 'retry safe'] },
]

