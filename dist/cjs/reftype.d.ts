/**
 * @module deleight/reftype
 * This module exports RefType and IterRefType classes which can
 * be used to refer to JavaScript objects from markup. It enables
 * the Angular-like declarative paradigm using pure, transparent and
 * explicit primitives. You are in control of everything and not a
 * framework. This will enable you to freely mix and match Reftype with
 * regular JavaScript and many other tools without fear of breaking
 * anything.
 *
 */
type IKey = string | number | symbol;
interface IStrObject {
    [key: string]: any;
}
type IMap<U> = {
    [key: IKey]: U;
};
/**
 * A calculation function
 */
type ICalc = (...args: any[]) => any;
interface IReaction {
    (element: Element, member: string, value: any): any;
}
type IRefTypeElement = Element | string | ((reftype: RefType) => Element);
interface IMultiValueReaction {
    name: string;
    values: MultiValue;
    index: number;
}
type IReactions = IMap<Map<Element, Set<string | IMultiValueReaction>>>;
interface IRefTypeOptions {
    suffix?: {
        attr?: string;
        prop?: string;
    };
    attr?: {
        text?: string;
        ref?: string;
        iter?: string;
        closed?: string;
    };
    sep?: {
        ref?: string;
        multivalue?: string;
        calc?: string;
    };
    calc?: IMap<ICalc>;
    self?: string;
    ref?: new (ref: any, options?: IRefTypeOptions, parent?: RefType) => RefType;
    iter?: new (ref: any, options?: IRefTypeOptions, parent?: RefType) => IterRefType;
    item?: new (ref: any, options?: IRefTypeOptions, parent?: RefType) => RefType;
}
type IIndexToIndex = {
    [key: number]: number;
};
/**
 * Base class for all multivalue instances providing the `set`
 * implementation.
 */
declare class MultiValue {
    values: any[];
    calc?: ICalc;
    constructor(values: any[], calc?: ICalc);
    set(index: number, value: any): any;
}
/**
 * Adds the reaction for `ref` to the map of all reactions of the
 * same type for agiven reftype.
 *
 * @param ref
 * @param element
 * @param reactions
 * @param reaction
 */
declare function addRef(ref: string, element: Element, reactions: IReactions, reaction: string | IMultiValueReaction): void;
/**
 * A wrapper around a regular JS object (refs) that automatically
 * synchronises registered DOM attributes and properties with properties
 * within the wrapped object.
 *
 */
declare class RefType {
    refs: IMap<any>;
    elements: Element[];
    options: IRefTypeOptions;
    parent?: RefType;
    attrs: IReactions;
    props: IReactions;
    multiValues: IMap<MultiValue>;
    children: IMap<RefType>;
    hidden: Map<HTMLElement, string>;
    /**
     * Creates a wrapper around {@link refs} to automatically modify added elements
     * when certain actions are performed on objects within it.
     * The actions include property setting or deleting and method invocations.
     * We can also call {@link RefType#react} directly to modify some or all added
     * elements.
     *
     * Attributes on the element trees can be used to describe attributes or
     * properties to set, elements to render or remove and element children
     * to add, render or remove in response to {@link RefType#react} invocations.
     *
     * 'Render' in this context means performing all registered reactive
     * operations on all added elements (including all elements within their trees).
     *
     * The great benefit of this is the ability to perform more abstract DOM
     * manipulations from JavaScript with the aid of descriptive attributes. It
     * removes the burden to know or keep track of everything in the markup. This
     * will provide more flexibility in designing and redesigning pages.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     *
     * @param refs
     * @param options
     * @param parent
     */
    constructor(refs: IMap<any>, options?: IRefTypeOptions, parent?: RefType);
    /**
     * Creates a multivalue instance, used for more complex ref
     * linking.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { sep: { multivalue: '+' } };
     * const reftype = new RefType(refs, options);
     * const multiValueStr = 'venus + & + mars';
     * const calc = (...args: string[]) => args.join('');
     * const { refs, values: multivalueObject } = reftype.createMultiValue(multivalueStr, calc);
     *
     * @param value
     * @param calc
     */
    createMultiValue(value: string, calc?: ICalc): {
        refs: any[];
        values: MultiValue;
    };
    /**
     * Links refs in the value to the specified members of the element.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.addValue('venus', document.querySelector('p'), reftype.props || {}, 'textContent')
     *
     * @param value
     * @param element
     * @param reactions
     * @param memberName
     */
    addValue(value: string, element: Element, reactions: IReactions, memberName: string): void;
    /**
     * Optionally add the elements that contain any directives that match the
     * requirements for this reftype. This can be called from anywhere in JavaScript code,
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     *
     * @param elements
     */
    add(...elements: Element[]): void;
    /**
     * Removes all reactions starting with {@link ref}. This is a
     * cleanup method that is also called automatically
     * from {@link RefType#delete}.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.remove('mars')    // removes all reactions associated with mars.
     *
     * @param ref
     */
    remove(ref?: string): this;
    /**
     * The main workhorse of this library. Calling this method modifies
     * the appropriate elements which have been added to this reftype.
     * What will be modified is typically determined by what has been
     * previously linked in {@link add} and what is passed as the {@link refs}
     * arg here.
     *
     * In the simplest case, we may call this method with no
     * args to perform all previously linked DOM actions. Supply specific
     * ref paths to limit DOM modifications to only those that are linked
     * to the refs (references) at those paths.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.react('mars')    // trigger all reactions associated with mars.
     *
     * @param refs
     * @returns
     */
    react(...refs: string[] | [IStrObject]): void | this;
    /**
     * Sets the properties on the wrapped object and calls {@link RefType#react}
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.set({ mars: 'Our dream planet.'})    // reactively sets the value of mars.
     *
     * @param refs
     */
    set(refs: IStrObject): this;
    /**
     * Delete the value pointed to by {@link ref} and triggers any linked
     * reactions.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.delete('mars')
     * // Removes mars from refs, reftype and everywhere it is referenced
     * // within document.body
     *
     * @param ref
     * @returns
     */
    delete(ref?: string): this;
    /**
     * Invokes the method pointed to by {@link ref} with the given
     * {@link args} and triggers any linked reactions on this reftype.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: (x) => x * 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.call('mars', 20)
     * // Invokes refs.mars to calculate 20 * 4 = 80 and assigns this value to
     * // all attributes and properties within document.body that refer to mars.
     *
     * @param ref
     * @param args
     * @returns
     */
    call(ref: string, ...args: any[]): any;
    /**
     * Returns an object containing the ref parent object (`.parent`) and
     * its property (`.prop`) in the object.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * const dest = reftype.destructure('mars')    // { parent: refs, prop: 'mars' }
     *
     * @param ref
     *
     */
    destructure(ref: string): any;
    /**
     * Returns the value pointed to by {@link ref} within {@link RefType#refs}
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * const marsValue = reftype.get('mars')    // 4
     *
     * @param ref
     *
     */
    get(ref: string): any;
    /**
     * Hides any elements this reftype is mounted on. That is all
     * elements in {@link RefType#elements}. This is called automatically
     * when {@link RefType#refs} is reactively set to `null` from {@link RefType#parent}.
     *
     * This works by setting the display property of the element styles
     * to `none`.
     *
     */
    hide(): void;
    /**
     * The reverse of {@link RefType#hide}. This restores the display
     * property of all elements in {@link RefType#elements} to their original
     * values. It is also called internally when {@link RefType#refs} is
     * set to anything other than `null` or `undefined` in {@link RefType#parent}.
     *
     */
    show(): void;
}
/**
 * Updates specified attributes and properties of the given elements with
 * the given value. The value will be set directly on the members if just
 * the member name is given in the set (a string). If instead an
 * IMultiValueMember object is used, the value is first used to call the
 * `set` method on its multivalue instance to update the instance and get
 * back the value to be set directly on the member.
 *
 * @example
 * import { RefType } from "deleight/reftype";
 * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
 * const reftype = new RefType(refs, options);
 * reftype.add(document.body)
 * react(reftype.attrs['mars'], 28, setAttr)
 * // traverses all reactions in the first arg to find all element attributes
 * // that refence `mars` and set 28 as their new values.
 *
 * @param map A map of Element to the set of members to update.
 * @param value The new value to set on the elements
 * @param reaction The function to implement the updates; normally setAttr or setProp.
 */
declare function react(map: Map<Element, Set<string | IMultiValueReaction>>, value: any, reaction: IReaction): void;
/**
 * Sets the specified attribute to the specified value if the value is
 * defined; otherwise remove the attribute.
 *
 * @example
 * import { setAttr } from 'deleight/reftype'
 * setAttr(document.querySelector('h1'), 'class', 'dance');
 *
 * @param element
 * @param member
 * @param value
 */
declare function setAttr(element: Element, member: string, value: any): void;
/**
 * Sets the specified property to the specified value if the value.
 * Additionally if the new value is undefined, deletes the property
 * from the element.
 *
 * @example
 * import { setProp } from 'deleight/reftype'
 * setProp(document.querySelector('h1'), 'textContent', 'Deleight');
 *
 * @param element
 * @param member
 * @param value
 */
declare function setProp(element: Element, member: string, value: any): void;
/**
 * A specialisation of `RefType` to support array methods and semantics.
 * The `ref` object wrapped by IterRefType should be an iterable. Any iterable
 * can be used for 'single-pass' scenarios where we just want to render a list
 * into the DOM.
 *
 * If the iterable will be modified later, use an array or an
 * iterable  with the same API (`push`, `pop`, set property  and `splice`).
 * This wrapper exposes similar methods for performing reactive modifications on
 * the iterable.
 *
 * @extends RefType
 */
declare class IterRefType extends RefType {
    /**
     * Map of linked elements to the arrays of item reftypes created
     * for them.
     */
    items: WeakMap<Element, RefType[]>;
    /**
     * When this is `true`, all the items will be wrapped with an
     * object containing both the item and its index in the created
     * item reftypes for each item. Also the indices will be reactive.
     * This can help in cases where the index forms part of the display
     * but is less performant and memory-efficient.
     *
     * To specify `addIndex` in markup, wrap the ref path with `{}`, as in
     * `<span>ite-r="{refPath}">item.prop</span>`
     *
     */
    addIndex?: boolean;
    /**
     * Map of linked elements to the templates created for them.
     */
    templates: WeakMap<Element, Element | DocumentFragment>;
    /**
     * Returns the template associated with this reftype. If the template
     * has neet been created yet or {@link replace} is truthy, the template
     * will be created from the content of the last element in
     * {@link IterRefType#elements}.
     *
     * This method is called when adding an element. The template will be
     * rendered with all the items in the array wrapped by this instance.
     *
     * For each rendered item a new {@link RefType} will be created with a
     * `refs` property holding both the item value and the item
     * index (`refs = { index, item }`). As a result, we can refer to the
     * item value and index within the template just like with any object
     * wrapped with RefType.
     *
     * Specify a template declaratively by placing it inside the
     * element, either directly or within a template element. We can also
     * programmatically set (or change) a template on an {@link IterRefType}.
     * or a subclass.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * const template = iterReftype.getTemplate(document.querySelector('ul'), true)
     * // this is part of what will happen if we instead did:
     * // iterReftype.add(document.querySelector('ul'))
     * // which will get the template and render it with all the items in
     * // iterRefType.refs immediately.
     *
     * @param element
     * @param [replace]
     * @returns
     */
    getTemplate(element: Element, replace?: boolean): Element | DocumentFragment;
    /**
     * Obtains and renders the template for all the added items.
     * We can use this to render multiple elements with the iterable
     * items at the same time.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     *
     * @param elements
     * @returns
     */
    add(...elements: Element[]): this;
    /**
     * Not recommended to be called directly. Calling for individual
     * items is unlikely to work while calling for the whole array
     * (that is without args) will work but it will be more inefficient in
     * all but cases where the array has changed substancially
     * 'from outside'.
     *
     * It is better to call the 'array-like' methods (push, pop, splice
     * and set).
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * refs.reverse();
     * iterRefType.react();
     *
     * @param refs
     * @returns
     */
    react(...refs: string[] | [IStrObject]): void | this;
    /**
     * Reeacts on only the specified elements. This is useful when
     * adding new elements to avoid wasteful reactions on existing
     * elements.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * refs.reverse();
     * iterRefType.reactOn(iterRefType.elements.at(-1));
     *
     * @param elements
     */
    reactOn(...elements: Element[]): void;
    /**
     * Creates a new reftype for an item.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * const child = iterRefType.createChild(iterRefType.elements.at(-1), 0, {name: 'unknown'});
     *
     * @param element
     * @param index
     * @param item
     */
    createChild(element: Element, index: number, item: any): RefType;
    /**
     * Renders and adds a new item at the given index or otherwise the
     * end of the list.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterRefType.addChild(iterRefType.elements.at(-1), {name: 'unknown'});
     *
     * @param element
     * @param item
     * @param beforeIndex
     */
    addChild(element: Element, item: any, beforeIndex?: number): void;
    /**
     * Reactively adds new items to the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.push({jupiter: 5}, {saturn: 6})  // push like a normal array
     *
     * @param items
     */
    push(...items: any[]): any;
    /**
     * Reactively pops the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.pop()  // pop like a normal array
     *
     */
    pop(): any;
    /**
     * Reactively splices the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.splice(1, 2)  // splice like a normal array
     *
     * @param start
     * @param deleteCount
     * @param items
     */
    splice(start: number, deleteCount?: number, ...items: any[]): any;
    /**
     * Supports structural changes in the array which do not
     * involve setting new values. We instead move array items along
     * with their linked elements to new positions.
     *
     * The function operates in two modes:
     * 1. `!swap`: move the item at {@link i1} to the {@link i2},
     * shifting the other items appropriately..
     *
     * 3. `swap`: swaps the items at {@link i1} and {@link i2}.
     * nothing is shifted.
     *
     * In both cases item indices will be updated to reflect their
     * new positions if {@link IterRefType#addIndex} is `true`.
     *
     * @example
     *
     *
     * @param i1
     * @param i2
     * @param swap
     */
    move(i1: number, i2: number, swap?: boolean): this;
    /**
     * Calls splice on the {@link IterRefType#refs} to ensure it behaves the
     * same way as the bound view which removes the DOM tree rendered
     * for the deleted item. This is unlike normal deleting of array
     * items which create 'holes' in them.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.delete(3)  // delete last item
     * iterReftype.delete()   // delete everything
     *
     * @param ref
     * @returns
     */
    delete(ref?: string): this;
}
/**
 * Global options.
 */
declare const options: IRefTypeOptions;

export { type ICalc, type IIndexToIndex, type IKey, type IMap, type IMultiValueReaction, type IReaction, type IReactions, type IRefTypeElement, type IRefTypeOptions, type IStrObject, IterRefType, MultiValue, RefType, addRef, options, react, setAttr, setProp };
