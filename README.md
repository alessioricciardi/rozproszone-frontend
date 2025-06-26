
# Project Startup Instructions

## 1. Downloading modules

Run the following command in the terminal to install all necessary dependencies:

```bash
pnpm install
```

---

## 2. Installing SSL certificates for the Nuxt Dev Server

To enable the Nuxt development server to run on HTTPS, follow these steps:

### a) Download and install the `mkcert` tool

The `mkcert` tool allows you to create local SSL certificates trusted by your system.

Download `mkcert` from:  
[https://github.com/FiloSottile/mkcert/releases](https://github.com/FiloSottile/mkcert/releases)

### b) Install the local Certificate Authority (CA)

Run the following command in your terminal:

```bash
mkcert -install
```

### c) Generate certificates for `localhost`

In your project folder, run:

```bash
mkcert localhost
```

This will generate two certificate files which should be placed in your project directory.

---

## 3. Running the project

After installing dependencies and certificates, start the Nuxt development server by running:

```bash
pnpm dev
```

---

**Done!** You can now open the project in your browser at `https://localhost` with HTTPS support.
