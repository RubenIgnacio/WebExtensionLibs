# WebExtensionLibs

El archivo **WebExtension.js** debe ir antes que las APIs de extensión que quiera usar, ya que estas dependen de el. *Ejem*:

```html
<script src="/path/to/WebExtension.js"></script>
<script src="/path/to/Alarm.js"></script>
```

 ## Índice

* [Alarm](#alarm)
* [Command](#command)
* [Notification](#notification)
* [StorageArea](#storagearea)
* [Tab](#tab)
* [WebExtension](#webextension)
* [WindowManager](#windowmanager)
* [License](#license)

## Alarm

```javascript
/*
 * Crea una alarma que se dispara una sola vez
 * despues de 5 minutos, si se omite el primer argumento
 * por defecto el nombre de la alarma será un string vacío("").
 */
Alarm.create("my-alarm", {delayInMinutes: 5});

// Use Alarm.getAll() para obtener todas las alarmas.
Alarm.get("my-alarm").then((alarmInfo) => {
  // Limpia la alarma.
  // Use Alarm.clearAll() para limpiar todas las alarmas.
  alarmInfo.clear();
});
```

En el ejemplo de abajo se muestra como agregar un escucha a un evento (en este caso _onAlarm_) y tiene como parámetro _alarmInfo_ pero en este caso no representa una instancia de Alarm.

```javascript
Alarm.addEventListener("alarm", (alarmInfo) => {
  /*
   * Puede pasar 'alarmInfo' como parametro para volverlo instancia de Alarm.
   * Ejem:
   *    alarmInfo = new Alarm(alarmInfo);
   */
  console.log("on alarm: " + alarmInfo.name);
});
```

## Command

```javascript
// Obtiene todos los comandos
Command.getAll().then((commands) => {
  for (command of commands) {
    console.log(command.name + ": " + command.description);
  }
});

// Agrega un escucha cuando se activa un comando
Command.addEventListener("command", (command) => {
  console.log("Command: " + command);
});
```

## Notification

```javascript
// Crea una instancia para la notificación.
var notification = new Notification('notifiId', {
  title: 'Saludo',
  message: 'Hola mundo',
  iconUrl: 'url_de_la_imgen' // Opcional en Firefox.
});
// Muestra la notificación e imprime en consola su 'id'.
notification.display().then((notificationId) => console.log(notificationId));
// Pasando solo el 'id' como argumento al crear la instancia.
notification = new Notification('notifiId');
notification.title = 'Saludo';
notification.message = 'Hola mundo';
/*
 * También puede cambiar los atributos de la notificación
 * como 'title', 'message', 'iconUrl', etc, en la llamada al método 'display'.
 */
notification.display({message: 'Adiós'});
notification.message; // Regresa 'Adiós'.
```

Si no especifica el _id_ de la notificación al crear la instancia o después de crearla, se usara _title_ como _id_ de la notificación.

```javascript
// Se debe pasar como mínimo el 'id' o 'title' como argumento al crear la instancia.
notification = new Notification(null, {title: 'Saludo', message: 'Hola mundo'});
notification.id // Regresa 'Saludo'.
```

## StorageArea

```javascript
var storage = new StorageArea();
// Muestra el objeto de clave/valor con todos los items almacenados.
storage.get(null).then((items) => console.log(items));
// Almacena uno o mas items en el storage.
storage.set({item1: "Hola mundo"}).then(() => console.log("Se almaceno correctamente."));
```

Por defecto *StorageArea* usa el *storage.local*, si en caso quiere usar otro, como *storage.sync*, puede pasar como segundo parámetro el tipo de almacenamiento a usar.

```javascript
// Obtiene todos los items almacenados en 'sync'.
storage.get(null, 'sync').then((items) => console.log(items));
```

También puede establecer el almacenamiento por defecto que prefiera.

```javascript
// usando el método 'setDefaultStorageAreaType' para cambiar el almacenamiento por defecto
storage.setDefaultStorageAreaType('sync');
// o especificarlo al crear la instancia.
var storageSync = new StorageArea('sync');
```

## Tab

```javascript
var tabId;
// Abre un nuevo tab en la ventana actual.
Tab.open({url: 'http://example.com/'}).then((tabInfo) => tabId = tabInfo.id);
// Cierra el tab después de 3 segundos.
setTimeout(() => {
  // También puede usar Tab.close([tabId1, tabId2, ..., tabIdN]) para cerrar uno o mas tabs.
  Tab.get(tabId).then((tabInfo) => tabInfo.close());
}, 3000);
```

También puede abrir un tab en una ventana especifica:

```javascript
// Pasando windowId en la llamada a open.
Tab.open({
  url: 'http://example.com/',
  windowId: id_de_la_ventana
});
// O desde una instancia de WindowManager.
windowInfo.openTab({url: 'http://example.com/'});
```

## WebExtension

El objeto *WebExtension* trae funciones para interactuar con las APIs para extensiones del navegador. *Ejem*:

```javascript
WebExtension.getAPI('commands');        // Retorna browser.commands,
                                        // si no encuentra la API lanza un error.
WebExtension.getAPI('commands', true);  // Retorna browser.commands,
                                        // si no encuentra la API retorna null.
```

## WindowManager

```javascript
var winId;
// Abre una ventana nueva.
WindowManager.open({
  url: 'http://example.com/',
  type: 'normal',
  state: 'maximized'
}).then((winInf) => winId = winInf.id);
// Cierra la ventana después de 3 segundos.
setTimeout(() => {
  WindowManager.get(winId).then((winInf) => winInf.close());
}, 3000);
```

## License

[MIT License](https://opensource.org/licenses/MIT).
