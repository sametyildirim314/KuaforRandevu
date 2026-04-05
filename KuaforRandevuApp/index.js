import { registerRootComponent } from 'expo';

import App from './App';

// Uygulamanın ana bileşenini Expo'ya (veya native sisteme) tanıtır.
// Bu sayede uygulama başlatıldığında hangi dosyadan başlayacağını anlar.
registerRootComponent(App);
