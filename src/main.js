import { mount } from 'svelte';
import App from './SimpleApp.svelte';  // Use the simplified version

const app = mount(App, {
  target: document.getElementById('app')
});

export default app;
