function promiseRace(arrs) {
  if (!Array.is(arrs)) {
    throw TypeError("argument must be an array");
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < arrs.length; i++) {
      arrs[i].then(resolve, reject);
    }
  });
}
