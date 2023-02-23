# JavaScript-native-function-implementation

# 前言

主要记录在准备秋招的过程中遇到的前端手写代码题。

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
