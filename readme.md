# Reftype

*Reftype* was the 10th library added to [deleight](https://github.com/mksunny1/deleight) which has now been abstracted into class-action, action-object and element-action. I think this library has been superceded by element-action; therefore it has been removed from the core project. This library is retained here because it is still useful on its own and some people may even prefer it.

Reftype aims to relieve the burden on the JavaScript programmer to know about the markup layout and structure in a large web application. Without *Reftype*, we manipulate all aspects of the DOM explicitly with Javascript. We may get some mileage from *Actribute* but the module is more abstract. 

*Reftype* provides an alternative pattern quite similar to how *Vue.JS* and *Angular* operate. It lets you declaratively describe DOM operations using attribute directives. The major difference with *Reftype* is that it is more transparent, explicit and composable. It aligns with the policy of *Deleight* to use straight HTML, CSS and JavaScript. It is deliberately designed to be fast, lightweight and memory-efficient.

```html
<main>
    <p t> mercury +&+ venus </p>
    <p t> mercury + or +venus</p>
    <p t>mercury + before + venus</p>
    <section t>earth</section>
    <article t class-a="color1| |color2">mars</article>
</main>
```

```js
import { RefType } from 'deleight/reftype'

const refs = {
    mercury: 'Planet mercury',
    venus: 'The second planet',
    earth: 'Our planet!',
    mars: 'Nearest planetary neighbor',
    color1: 'red',
    color2: 'green'
};

const reftype = new RefType(refs, { sep: { multivalue: '+' } });
reftype.add(document.querySelector('main'));
reftype.react();                     // will apply all reactions
reftype.set({ color1: 'blue' });     // will apply specific reaction...

```
