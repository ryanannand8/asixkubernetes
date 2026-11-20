# Caso Práctico I: Alta disponibilidad con Nginx en Kubernetes

Documentación técnica y guía de resolución para el entorno de pruebas (*Proof of Concept*, PoC): despliegue de un servidor web Nginx en alta disponibilidad con Kubernetes y Minikube sobre Linux / WSL2.

## Requisitos previos

- Docker Engine en ejecución.
- Minikube v1.30+ instalado.
- `kubectl` instalado y configurado.

## Tarea 1: Inicialización del entorno de pruebas

Iniciar el clúster local con el driver de Docker:

```bash
minikube start --driver=docker
```

Verificar el estado del nodo principal y la versión de la API (`kube-apiserver`):

```bash
minikube status
kubectl get nodes -o wide
kubectl version
```

> El campo **Server Version** de `kubectl version` indica la versión activa de `kube-apiserver`.

## Tarea 2: Definición declarativa del despliegue

El fichero [`nginx-deployment.yaml`](nginx-deployment.yaml) define un Deployment de 3 réplicas:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mi-nginx
  template:
    metadata:
      labels:
        app: mi-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
```

## Tarea 3: Despliegue y verificación de la jerarquía

Aplicar el manifiesto en el clúster:

```bash
kubectl apply -f nginx-deployment.yaml
```

Inspeccionar la jerarquía de recursos (Deployment → ReplicaSet → Pods):

```bash
kubectl get deployment nginx-deployment
kubectl get rs
kubectl get pods -o wide
```

Resultado esperado:

- **Deployment:** `nginx-deployment` (3/3 réplicas listas).
- **ReplicaSet implícito:** `nginx-deployment-<hash>`, generado automáticamente por el Deployment.
- **Pods:** 3 instancias `nginx-deployment-<hash>-<id>` en estado `Running`, cada una con su IP interna asignada por la red del clúster.

## Tarea 4: Prueba de resiliencia y autorrecuperación (*self-healing*)

Eliminar manualmente uno de los Pods activos:

```bash
kubectl delete pod <nombre-del-pod>
```

Observar la recuperación automática en tiempo real:

```bash
kubectl get pods -w
```

**Análisis del comportamiento:** el `kube-controller-manager` (mediante el controlador de ReplicaSet) detecta la diferencia entre el estado deseado guardado en etcd (3 réplicas) y el estado real (2 réplicas). Solicita de inmediato al `kube-apiserver` la creación de un nuevo Pod; el `kube-scheduler` lo asigna a un nodo disponible y el `kubelet` arranca el contenedor de reemplazo.

## Tarea 5: Escalado dinámico

Escalar de forma imperativa de 3 a 5 réplicas:

```bash
kubectl scale deployment nginx-deployment --replicas=5
```

Comprobar que los 5 Pods están operativos:

```bash
kubectl get pods -o wide
```

## Tarea 6: Exposición del servicio y acceso externo

Exponer el Deployment mediante un servicio NodePort:

```bash
kubectl expose deployment nginx-deployment --type=NodePort --port=80
```

Obtener la URL de acceso:

```bash
minikube service nginx-deployment --url
```

> Si usas WSL2 con el driver Docker, mantén esta terminal abierta: es la que crea el túnel local.

Comprobar la respuesta HTTP:

```bash
curl -I <URL_OBTENIDA>
```

**Resultado esperado:** cabecera `HTTP/1.1 200 OK` y la página de bienvenida de Nginx al abrir la URL en el navegador.

## Diferencia técnica: Pod vs. ReplicaSet vs. Deployment

| Recurso | Función y nivel de abstracción |
|---------|--------------------------------|
| **Pod** | Unidad mínima de ejecución en Kubernetes. Agrupa uno o más contenedores que comparten red (IP) y volúmenes. Es efímero y no se autorrepara por sí solo si falla. |
| **ReplicaSet** | Controlador que garantiza que un número determinado de réplicas idénticas de un Pod estén en ejecución en todo momento (*self-healing* y escalado). |
| **Deployment** | Recurso declarativo de nivel superior que gestiona ReplicaSets. Permite actualizaciones progresivas sin corte de servicio (*Rolling Updates*), pausar despliegues y revertir cambios (*Rollbacks*). |

## Limpieza del entorno

```bash
kubectl delete service nginx-deployment
kubectl delete deployment nginx-deployment
```
