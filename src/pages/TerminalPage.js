// Home component
export class TerminalPage {
    constructor() {
        this.container = document.getElementById('main-content');
    }

    render() {
        this.container.innerHTML = `
            <iframe class="pt-24 bg-black w-full h-screen"
              src="https://codesandbox.io/embed/new?codemirror=1&fontsize=14&hidenavigation=1&theme=dark"
              style="border:0; overflow:hidden;"
              title="Nuevo Sandbox - CodeSandbox"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            ></iframe>
        `;
    }
}