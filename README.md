# ASIX Kubernetes

Casos prácticos de Kubernetes del módulo de ASIX2, desplegados en local con **Minikube** (driver Docker) sobre Linux / WSL2.

## Casos prácticos

| Caso | Contenido | Conceptos | Documentación |
|------|-----------|-----------|---------------|
| **I** | Servidor Nginx en alta disponibilidad | Deployment, autorrecuperación, escalado, NodePort | [`caso1/`](caso1/README.md) |
| **II** | WordPress + MySQL | Secret, PersistentVolumeClaim, DNS interno | [`caso2/`](caso2/readme) |
| **III** | App de 3 capas: Nginx → Node.js → MongoDB | Namespace, ConfigMap, Secret, PVC, imagen propia | [`caso3/`](caso3/README) |
| **IV** | Despliegue progresivo de Nginx | Pod vs ReplicaSet vs Deployment | [`caso4/`](caso4/README) |
| **V** | Tienda *asir-shop* en clúster de 3 nodos | Multinodo, proxy inverso Nginx, PostgreSQL + PVC, drenado de nodos | [`caso5/asixshop/`](caso5/asixshop/README) |

## Estructura

```
.
├── caso1/                           # Nginx en alta disponibilidad
├── caso2/                           # WordPress + MySQL
├── caso3/
│   ├── back/                        # Backend Node.js (Dockerfile)
│   └── k8s/                         # Manifiestos numerados en orden de aplicación
├── caso4/                           # Pod, ReplicaSet y Deployment
└── caso5/asixshop/                  # asir-shop multinodo
```

## Requisitos

- Docker Engine
- Minikube v1.30+
- kubectl

```bash
minikube start --driver=docker
# Caso V usa 3 nodos:
minikube start --driver=docker --nodes=3
```

## Credenciales (Secrets)

Los Secrets con contraseñas **no se suben al repositorio**. Cada caso incluye una plantilla `*.yaml.example`; cópiala, pon tus valores y aplícala antes que el resto de manifiestos:

| Caso | Comando |
|------|---------|
| II | `cp caso2/secrets.yaml.example caso2/secrets.yaml` |
| III | `cp caso3/k8s/01-mongo-secret.yaml.example caso3/k8s/01-mongo-secret.yaml` |
| V | `cp caso5/asixshop/postgres-secret.yaml.example caso5/asixshop/postgres-secret.yaml` |

Los ficheros resultantes están en `.gitignore`, así que no se subirán por error. Las plantillas usan la extensión `.example` para que `kubectl apply -f .` no las aplique.
