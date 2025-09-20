
# 项目启动与部署指南

本文档将指导你如何在本地环境中启动项目，以及如何将其部署到 Vercel。

## 本地启动

在开始之前，请确保你已经安装了 [pnpm](https://pnpm.io/)。

1. **安装依赖**

   在项目根目录下运行以下命令来安装所有必需的依赖项：

   ```bash
   pnpm install
   ```

2. **启动开发服务器**

   安装完依赖后，运行以下命令来启动本地开发服务器：

   ```bash
   pnpm dev
   ```

   服务启动后，你通常可以在 `http://localhost:6680` 访问你的应用。

## 部署到 Vercel

你可以轻松地将此项目部署到 Vercel。

1. **导入项目**

   登录到你的 Vercel 帐户，然后选择 "Add New... > Project"，接着从你的 Git 提供商（如 GitHub、GitLab 或 Bitbucket）导入此项目仓库。

2. **配置部署设置**

   在导入过程中，Vercel 通常会自动检测项目的框架和设置。如果需要手动配置，请使用以下设置：

   - **Framework Preset**: `Other`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

3. **部署**

   完成配置后，点击 "Deploy" 按钮。Vercel 将开始构建和部署你的项目。部署完成后，你将获得一个可公开访问的 URL。

