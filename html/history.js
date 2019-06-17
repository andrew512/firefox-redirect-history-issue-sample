
// wrapper to emit events for `pushState` and `replaceState` operations
var wrapFunc = function (type) {
    var orig = window.history[type]
    return function () {
        var value = orig.apply(this, arguments)
        var e = new Event(type)
        e.arguments = arguments
        window.dispatchEvent(e)
        return value
    }
}
// wrap `pushState` and `replaceState` so we can receive events when they occur
window.history.pushState = wrapFunc('pushState')
window.history.replaceState = wrapFunc('replaceState')

// wire listeners for page load and history events
window.addEventListener('load', () => {
    console.info(` --- window.load ---`)
    console.info(`History length: ${window.history.length}`)
    console.info(`Initial location path: ${window.location.pathname}`)
    route(window.location.pathname)
})
window.addEventListener('replaceState', e => {
    const path = e.arguments[2]
    console.info(`   ->  replaceState event: ${path}`)
    route(path)
})
window.addEventListener('pushState', e => {
    const path = e.arguments[2]
    console.info(`   ->  pushState event: ${path}`)
    route(path)
})

const transitionPage = (currentPage, newPage, doReplace) => {
    document.getElementById('content').innerHTML = `
<h1>
    ${currentPage}
</h1>
<p>${doReplace ? '<code>history.replaceState</code> with' : 'Push'} <code>${newPage}</code> in 3 seconds...</p>
`    
    const actionName = doReplace ? 'replaceState' : 'pushState'
    setTimeout(() => {
        console.info(` ---> Calling history.${actionName}: ${newPage}`, )
        if (doReplace) {
            window.history.replaceState({}, '', newPage)
        } else {
            window.history.pushState({}, '', newPage)
        }
    }, 3000)
}

const handlePage1 = () => {
    transitionPage('/page1', '/page2', true)
}

const handlePage2 = () => {
    transitionPage('/page2', '/page3', true)
}

const handlePage3 = () => {
    console.info(' **** Landed on /page3')
    document.getElementById('content').innerHTML = `
<h1>
    /page3
</h1>
<p>
    In Firefox, reloading this page using the browser button or <code>location.reload()</code> will result in:
    <ul>
        <li>A server GET request for <code>/page3</code></li>
        <li>A console log message of <code>Navigated to {server}/page3</code></li>
        <li>An address bar change back to <code>{server}/page1</code> prior to any JavaScript execution</li>
    </ul>
    Due to the address bar change, at page load JavaScript believes the current location is <code>/page1</code> and thus repeats the sequence of <code>/page1</code> to <code>/page2</code> to <code>/page3</code> once again, instead of loading <code>/page3</code> directly.
</p>
<h2>Other Notes</h2>
<ul>
    <li>Selecting the current URL in the address bar and hitting enter (to submit the request) will result in a server request for <code>/page3</code> and, unlike the reload operation, <strong>will not</strong> roll back the location history to <code>/page1</code>. The location remains <code>/page3</code> as expected. At this point, subsequent page reload operations via browser button or <code>location.reload()</code> will now work as expected.</li>
    <li>Adding a <code>history.pushState</code> transition will prevent the issue from occurring.</li>
</ul>
<p>
    <a href="javascript:window.location.reload()">
        Call location.reload()
    </a>
</p>
<p>
    <a href="/">
        Start Over
    </a>
</p>
`
}

const route = path => {
    if (path === '/page1') {
        handlePage1()
    } else if (path === '/page2') {
        handlePage2()
    } else if (path === '/page3') {
        handlePage3()
    }
}
