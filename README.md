# JavaScript-native-function-implementation

# 前言

主要记录在准备秋招的过程中遇到的前端手写代码题，因为我也是个学生，我在看其他博客总结的手写题时会有一些难以理解的点但博客里并没有说明，所以我在解决每一个问题就会记录在这篇博客，也许我之前不明白的问题刚好也是你不明白的问题，所以这篇博客适合校招基础不扎实的同学学习，如果觉得对你有帮助，麻烦点个 star，谢谢！

> 本文引用博客[高频前端面试题汇总](https://juejin.cn/post/6946136940164939813#heading-14),
> 并以我的理解解释了代码中一些不太容易理解的点,方便同学们能够更好地理解每一道题。

# JavaScript 基础

## 手写 `Object.create`

思路：将传入的对象作为原型

```javascript
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

## 手写 instanceof 方法

instanceof 运算符用于判断构造函数的**_prototype_**属性是否出现在对象的原型链中的任何位置。

`instanceof`主要的实现原理就是右边变量的`prototype`在左边变量的原型链上即可。`instanceof`在查找的过程中会遍历左边变量的原型链，直到找到右边变量的`prototype`,如果查找失败，则会返回 false，告诉我们左边变量并非是右边变量的实例。

实现步骤：

1. 首先获取类型的原型
2. 然后获取对象的原型
3. 然后一直循环判断对象的类型是否等于类型的原型，知道对象原型为`null`，因为原型链最终为`null`

具体代码：

```javascript
function new_instance_of(leftValue, rightValue) {
  let rightProto = rightValue.prototype; // 取右表达式的 prototype 值
  leftValue = leftValue.__proto__; // 取左表达式的 __proto__ 值
  while (true) {
    if (leftValue === null) {
      return false;
    }
    if (leftValue === rightProto) {
      return true;
    }
    leftValue = leftValue.__proto__;
  }
}
```

以下是一些例子：

```javascript
function Foo() {}

Object instanceof Object; // true
Function instanceof Function; // true
Function instanceof Object; // true
Foo instanceof Foo; // false
Foo instanceof Object; // true
Foo instanceof Function; // true
```

## 手写 new 操作符

在调用 `new` 的过程中会发生以下四件事情：

（1）首先创建了一个新的空对象
（2）设置原型，将对象的原型设置为函数的`prototype`对象
（3）让函数的`this`指向这个对象，执行构造函数的代码（为这个新对象添加属性）
（4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，则返回这个引用类型的对象

```javascript
// const xxx = _new(Foo, 'haha', 123) ==> new Foo('haha',123)
function _new(fn) {
  // 1. 获取除fn以外的所有arguments
  // 使用slice删除arguments第一个元素就得到其他arguments
  const args = Array.prototype.slice.call(arguments, 1); // ['haha',123]
  // 创建一个对象 用于函数变对象
  const newObj = {};
  // 原型链被赋值为原型对象
  newObj.__proto__ = fn.prototype;
  // this 指向新对象
  fn.apply(newObj, fn);
  // 返回这个对象
  return newObj;
}
```

## 手写 防抖 代码

```javascript
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    // console.log("this", this);
    let context = this;
    // console.log("args", arguments);
    let args = arguments;
    timer = setTimeout(function () {
      // console.log(arguments) // 这个函数没有默认传进来的arguments，因为它并不是被监听事件调用的。
      // console.log(this); // this指向windows
      func.apply(context, args);
    }, delay);
  };
}
```

## 手写 节流 代码

```javascript
function throttle(func, delay) {
  let pre = 0;
  return function () {
    let now = new Date();
    let context = this;
    let args = arguments;
    if (now - pre > delay) {
      func.apply(context, args);
      pre = now;
    }
  };
}
```

## 手写 call 函数

`call`函数的实现步骤：

1. 判断调用对象是否为函数，即使我们是定义在函数的原型上的，但是可能出现使用`call`等方式调用的情况。

2. 判断传入上下文对象`context`对象是否存在，如果不存在，则设置为`window`。

3. 处理传入的参数，截取第一个参数后的所有参数。

4. 将函数作为上下文对象的一个属性。

5. 使用上下文对象来调用这个方法，并保存返回结果。

6. 删除刚才新增的属性。

7. 返回结果。

```javascript
Function.prototype.myCall = function (context) {
  // 判断调用对象
  if (typeof this !== "function") {
    console.error("type error");
  }
  // 获取参数
  let args = [...arguments].slice(1);
  let result = null;
  // 判断 context 是否传入，如果未传入则设置为 window
  context = context || window;
  // 将调用函数设为对象的方法
  context.fn = this;
  // 调用函数
  result = context.fn(...args);
  // 将属性删除
  delete context.fn;
  return result;
};
```

## 手写 apply 函数

`apply` 函数的实现步骤：

1. 判断调用对象是否为函数，即使我们是定义在函数的原型上的，但是可能出现使用`call`等方式的调用。

2. 判断传入上下文对象是否存在，如果不存在，设置为`window`。

3. 将函数作为上下文对象的一个属性。

4. 判断参数值是否传入

5. 使用上下文对象来调用这个方法，并保存返回结果。

6. 删除刚才新增的属性。

7. 返回结果。

```javascript
Function.prototype.myApply = function (context) {
  if (typeof context !== "function") {
    console.error("Error");
  }
  let result = null;
  // 判断 context 是否存在，如果未传入则为 window
  context = context || window;
  // 将函数设为对象的方法
  context.fn = this;
  // 调用方法
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn;
  }

  // 将属性删除
  delete context.fn;
  return result;
};
```

## 手写 bind 函数

`bind` 函数的实现步骤：

1. 判断调用对象是否为函数，即使我们是定义在函数的原型上的，但是可能出现使用`call`等方式的调用。

2. 保存当前函数的引用，获取其余传入参数值。

3. 创建一个函数返回

4. 函数内部使用`apply`来绑定函数调用，需要判断函数作为构造函数的情况，这个时候需要传入当前函数的`this`给`apply`调用，其余情况都传入指定的上下文对象。

```javascript
Function.prototype.myBind = function (context) {
  // 判断调用对象是否为函数
  if (typeof context !== "function") {
    console.error("Error");
  }

  // 获取参数
  let args = [...arguments].slice(1);
  let fn = this;
  return function Fn() {
    // 根据调用方式，传入不同绑定值
    return fn.apply(
      this instanceof Fn ? this : context,
      args.concat(...arguments)
    );
  };
};
```

**为什么会有第四条的判断呢?**接下来我们举个例子：

假设有这样一个构造函数：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
```

现在我们想创建一个新的 Person 对象，并把它绑定到一个特定的上下文对象上：

```javascript
const context = { city: "Beijing" };
const fn = Person.myBind(context, "Alice", 20);
const person = new fn();
```

在这个例子中，我们使用 myBind 函数将 Person 函数绑定到 context 对象上，并传入 "Alice" 和 20 两个参数。接着，我们创建一个新的函数 fn，并使用 new 关键字调用它，创建了一个新的 Person 对象 person。

由于在这里使用了 new 关键字，我们期望 person 对象的上下文是它本身。因此，如果在绑定函数中使用 context 作为上下文对象，那么 person 对象将无法正确地被创建。

因此，在这个例子中，使用 this instanceof Fn ? this : context 来判断应该使用哪个上下文对象。如果 this 指向新创建的对象，就使用它自己作为上下文对象；否则，就使用传入的 context 作为上下文对象。这就保证了 person 对象的正确创建，以及绑定函数的灵活性。

**为什么 context 会多出 name 和 age 属性呢？**

如果最后不是 new 一个新的 person，而是直接`fn()`

在 myBind 函数中，我们使用 args.concat(...arguments) 将绑定函数 fn 的参数列表和调用 fn() 函数时传入的参数合并为一个新的参数数组。在调用 fn() 函数时，我们并没有传入任何参数，所以 args.concat(...arguments) 返回的数组中只包含了两个元素："Alice" 和 20。

在绑定函数 fn 的执行过程中，args 数组中的两个元素 "Alice" 和 20 将被作为 Person 函数的参数，然后传递给 Person 函数进行调用。因此，Person 函数的执行结果将会返回一个对象，该对象具有 name 和 age 两个属性，这两个属性的值分别为 "Alice" 和 20。

当我们在调用 fn() 函数时，实际上是在调用 Person 函数，并且在调用时使用了 context 对象作为 this 对象。因此，在 Person 函数中，this 对象将会指向 context 对象。在 Person 函数中，我们为 this 对象添加了两个属性 name 和 age，因此在 context 对象中也会包含这两个属性，并且它们的值分别为 "Alice" 和 20。

# 数据处理

## 实现数组的乱序输出

主要的实现思路就是：

- 取出数组的第一个元素，随机产生一个索引值，将该第一个元素和这个索引对应的元素进行交换。

- 第二次取出数据数组第二个元素，随机产生一个除了索引为 1 的之外的索引值，并将第二个元素与该索引值对应的元素进行交换

- 按照上面的规律执行，直到遍历完成。

```javascript
function shuffleArray(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    // Math.floor() 总是返回小于等于一个给定数字的最大整数
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffledArr = shuffleArray(arr);
console.log(shuffledArr);
```

`Math.random() * (i + 1) `生成一个 0 到 i+1 之间的随机小数，因为在第 i 轮迭代中，前 i 个元素已经随机交换并放在数组的前面位置，因此下一个随机选取的元素只能从剩余的 n-i 个元素中选择，所以要在 n-i 个元素中随机生成一个索引，而 Math.random() \_ (i + 1) 可以保证随机生成的索引在 0 到 i+1 的范围内，从而实现了在剩余元素中随机选取一个元素的目的。

**生成的随机小数包括 i+1 吗?**

不包括 i+1。Math.random() 生成的随机数是一个大于等于 0 且小于 1 的小数，因此乘以 (i+1) 后得到的随机数范围是 0 到 i+1 之间的一个小数，但不包括 i+1。因为数组的下标是从 0 开始的，所以最后的随机下标应该在 0 到 i 之间，包括 0 和 i。

## 交换 a,b 的值，不能用临时变量

1. 巧妙的利用两个数的和、差：

```javascript
a = a + b;
b = a - b;
a = a - b;
```

2. ES6 解构赋值

```javascript
[a, b] = [b, a];
```

## 实现数组的扁平化
