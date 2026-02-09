## Fast

Fastest JS engine ever :) That is true, see the benchmark results (ran on the author's old Intel i7):

```
--------- Benchmark Render ---------
vanilla render x 25,887,906 ops/sec ±1.96% (90 runs sampled)
zzz render x 26,094,676 ops/sec ±2.12% (89 runs sampled)
literal render x 18,892,337 ops/sec ±1.50% (90 runs sampled)
zup render x 3,288,075 ops/sec ±1.15% (92 runs sampled)
ejs render x 272,557 ops/sec ±1.12% (93 runs sampled)
dot render x 1,121,797 ops/sec ±1.48% (88 runs sampled)
edge render x 8,030 ops/sec ±1.99% (87 runs sampled)
handlebars render x 146,572 ops/sec ±1.29% (92 runs sampled)
Fastest is zzz render, vanilla render
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
