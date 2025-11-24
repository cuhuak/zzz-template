## Fast

Fastest JS engine ever :) That is true, see the benchmark results (ran on the author's old Intel i7):

```
--------- Benchmark Render ---------
vanilla render x 24,478,910 ops/sec ±1.23% (91 runs sampled)
zzz render x 24,256,470 ops/sec ±1.25% (90 runs sampled)
literal render x 16,843,920 ops/sec ±1.63% (89 runs sampled)
zup render x 2,738,409 ops/sec ±1.43% (91 runs sampled)
ejs render x 247,632 ops/sec ±2.10% (91 runs sampled)
dot render x 1,096,741 ops/sec ±0.58% (93 runs sampled)
edge render x 8,037 ops/sec ±1.80% (90 runs sampled)
Fastest is vanilla render, zzz render
```

Try to run benchmarks
```
# go to bench 
cd bench

# install deps
npm i

# run
npm run bench
```
