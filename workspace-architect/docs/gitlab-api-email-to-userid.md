# GitLab API 接口文档 - 补充：通过邮件获取成员 ID

---

## 📋 接口概述

**功能**：通过用户邮箱地址获取 GitLab 用户 ID

**适用场景**：
- 自动化添加成员到 Group/Project
- 用户同步（从 LDAP/AD 同步到 GitLab）
- 批量管理用户权限

---

## 🔌 API 接口

### 1. 通过邮箱搜索用户

**请求**：
```http
GET /api/v4/users?search=<email>
Host: gitlab.example.com
Authorization: Bearer <your-token>
```

**cURL 示例**：
```bash
curl --header "PRIVATE-TOKEN: <your-token>" \
  "https://gitlab.example.com/api/v4/users?search=harry@example.com"
```

**响应示例**：
```json
[
  {
    "id": 123,
    "username": "harry",
    "name": "Harry Potter",
    "state": "active",
    "email": "harry@example.com",
    "avatar_url": "https://gitlab.example.com/uploads/-/system/user/avatar/123/avatar.png",
    "web_url": "https://gitlab.example.com/harry",
    "created_at": "2026-01-01T00:00:00.000Z",
    "bio": null,
    "location": null,
    "public_email": "harry@example.com",
    "skype": null,
    "linkedin": null,
    "twitter": null,
    "website_url": null,
    "organization": null,
    "job_title": null,
    "pronouns": null,
    "bot": false,
    "work_information": null,
    "followers": 0,
    "following": 0,
    "local_time": null
  }
]
```

**关键字段**：
| 字段 | 说明 |
|------|------|
| `id` | **用户 ID**（添加成员时需要） |
| `username` | 用户名 |
| `email` | 邮箱地址 |
| `state` | 用户状态（active/blocked/deleted） |

---

### 2. 精确匹配邮箱（推荐）

**说明**：`search` 参数是模糊匹配，可能返回多个结果。如需精确匹配，需在后端过滤。

**Python 示例**：
```python
def get_user_id_by_email(email, token, gitlab_url):
    """通过邮箱精确匹配获取用户 ID"""
    headers = {"PRIVATE-TOKEN": token}
    url = f"{gitlab_url}/api/v4/users?search={email}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"API 请求失败：{response.status_code}")
        return None
    
    users = response.json()
    
    # 精确匹配邮箱
    for user in users:
        if user.get('email', '').lower() == email.lower():
            return user['id']
    
    # 如果没找到，尝试匹配 public_email
    for user in users:
        if user.get('public_email', '').lower() == email.lower():
            return user['id']
    
    return None

# 使用示例
user_id = get_user_id_by_email(
    email="harry@example.com",
    token="glpat-your-token",
    gitlab_url="https://gitlab.example.com"
)

if user_id:
    print(f"找到用户 ID: {user_id}")
else:
    print("未找到该邮箱的用户")
```

---

## 🔐 权限要求

| 令牌权限 | 是否必需 | 说明 |
|----------|----------|------|
| `read_user` | ✅ 必需 | 读取用户信息 |
| `read_api` | ✅ 推荐 | 完整 API 读取权限 |
| `api` | ✅ 推荐 | 完整 API 权限（包含读取用户） |

**创建令牌时选择**：
```
☑ read_user
☑ read_api
```

---

## 📦 完整代码示例

### Python 类封装

```python
#!/usr/bin/env python3
"""
GitLab 用户管理模块
功能：通过邮箱获取用户 ID、添加成员到 Group/Project
"""

import requests
from typing import Optional, List, Dict

class GitLabUserManager:
    def __init__(self, gitlab_url: str, token: str):
        self.gitlab_url = gitlab_url.rstrip('/')
        self.token = token
        self.headers = {"PRIVATE-TOKEN": token}
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """
        通过邮箱获取用户信息
        
        Args:
            email: 用户邮箱地址
            
        Returns:
            用户信息字典，未找到返回 None
        """
        url = f"{self.gitlab_url}/api/v4/users?search={email}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            print(f"API 请求失败：{response.status_code} - {response.text}")
            return None
        
        users = response.json()
        
        # 精确匹配邮箱
        for user in users:
            user_email = user.get('email', '').lower()
            public_email = user.get('public_email', '').lower()
            
            if email.lower() in [user_email, public_email]:
                return user
        
        return None
    
    def get_user_id_by_email(self, email: str) -> Optional[int]:
        """
        通过邮箱获取用户 ID
        
        Args:
            email: 用户邮箱地址
            
        Returns:
            用户 ID，未找到返回 None
        """
        user = self.get_user_by_email(email)
        return user['id'] if user else None
    
    def add_member_to_group(self, group_id: int, user_id: int, 
                            access_level: int = 30) -> bool:
        """
        添加用户到 Group
        
        Args:
            group_id: Group ID
            user_id: 用户 ID
            access_level: 权限级别 (10=Guest, 20=Reporter, 30=Developer, 
                                     40=Maintainer, 50=Owner)
        
        Returns:
            成功返回 True，失败返回 False
        """
        url = f"{self.gitlab_url}/api/v4/groups/{group_id}/members"
        data = {
            "user_id": user_id,
            "access_level": access_level
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code == 201:
            print(f"✅ 成功添加用户 {user_id} 到 Group {group_id}")
            return True
        elif response.status_code == 409:
            print(f"⚠️  用户 {user_id} 已是 Group {group_id} 成员")
            return False
        else:
            print(f"❌ 添加失败：{response.status_code} - {response.text}")
            return False
    
    def add_member_to_project(self, project_id: int, user_id: int,
                              access_level: int = 30) -> bool:
        """
        添加用户到 Project
        
        Args:
            project_id: Project ID
            user_id: 用户 ID
            access_level: 权限级别
            
        Returns:
            成功返回 True，失败返回 False
        """
        url = f"{self.gitlab_url}/api/v4/projects/{project_id}/members"
        data = {
            "user_id": user_id,
            "access_level": access_level
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code == 201:
            print(f"✅ 成功添加用户 {user_id} 到 Project {project_id}")
            return True
        elif response.status_code == 409:
            print(f"⚠️  用户 {user_id} 已是 Project {project_id} 成员")
            return False
        else:
            print(f"❌ 添加失败：{response.status_code} - {response.text}")
            return False
    
    def add_member_by_email(self, group_id: int, email: str,
                            access_level: int = 30) -> Optional[int]:
        """
        通过邮箱添加用户到 Group（一站式方法）
        
        Args:
            group_id: Group ID
            email: 用户邮箱
            access_level: 权限级别
            
        Returns:
            用户 ID，失败返回 None
        """
        # 步骤 1：通过邮箱获取用户 ID
        user_id = self.get_user_id_by_email(email)
        
        if not user_id:
            print(f"❌ 未找到用户：{email}")
            return None
        
        # 步骤 2：添加用户到 Group
        if self.add_member_to_group(group_id, user_id, access_level):
            return user_id
        
        return None


# ========== 使用示例 ==========

if __name__ == '__main__':
    # 初始化
    manager = GitLabUserManager(
        gitlab_url="https://gitlab.example.com",
        token="glpat-your-token"
    )
    
    # 示例 1：通过邮箱获取用户 ID
    print("========== 示例 1：获取用户 ID ==========")
    user_id = manager.get_user_id_by_email("harry@example.com")
    if user_id:
        print(f"用户 ID: {user_id}")
    
    # 示例 2：添加用户到 Group
    print("\n========== 示例 2：添加用户到 Group ==========")
    manager.add_member_to_group(
        group_id=1,
        user_id=123,
        access_level=40  # Maintainer
    )
    
    # 示例 3：一站式添加（通过邮箱）
    print("\n========== 示例 3：一站式添加 ==========")
    user_id = manager.add_member_by_email(
        group_id=1,
        email="sally@example.com",
        access_level=30  # Developer
    )
    if user_id:
        print(f"添加成功，用户 ID: {user_id}")
    
    # 示例 4：批量添加用户
    print("\n========== 示例 4：批量添加 ==========")
    users_to_add = [
        {"email": "user1@example.com", "access_level": 30},
        {"email": "user2@example.com", "access_level": 30},
        {"email": "admin@example.com", "access_level": 40},
    ]
    
    for user_info in users_to_add:
        manager.add_member_by_email(
            group_id=1,
            email=user_info["email"],
            access_level=user_info["access_level"]
        )
```

---

### Bash 脚本示例

```bash
#!/bin/bash
# get-user-id-by-email.sh
# 功能：通过邮箱获取 GitLab 用户 ID

GITLAB_URL="https://gitlab.example.com"
TOKEN="glpat-your-token"
EMAIL=$1

if [ -z "$EMAIL" ]; then
    echo "用法：$0 <email>"
    exit 1
fi

# API 请求
RESPONSE=$(curl --silent --header "PRIVATE-TOKEN: $TOKEN" \
  "$GITLAB_URL/api/v4/users?search=$EMAIL")

# 解析 JSON（需要 jq）
USER_ID=$(echo "$RESPONSE" | jq -r ".[] | select(.email == \"$EMAIL\" or .public_email == \"$EMAIL\") | .id" | head -1)

if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
    echo "✅ 找到用户 ID: $USER_ID"
    
    # 获取用户名
    USERNAME=$(echo "$RESPONSE" | jq -r ".[] | select(.id == $USER_ID) | .username")
    echo "   用户名：$USERNAME"
else
    echo "❌ 未找到用户：$EMAIL"
    exit 1
fi
```

**使用**：
```bash
# 赋予执行权限
chmod +x get-user-id-by-email.sh

# 运行
./get-user-id-by-email.sh harry@example.com
```

---

## 🔍 常见问题

### Q1: 搜索返回多个用户？

**原因**：`search` 参数是模糊匹配，可能匹配到多个用户。

**解决**：在后端精确过滤邮箱：
```python
# 精确匹配
for user in users:
    if user.get('email', '').lower() == email.lower():
        return user['id']
```

---

### Q2: 用户设置了隐私保护，看不到邮箱？

**原因**：用户设置了 `public_email` 而非 `email`。

**解决**：同时检查两个字段：
```python
user_email = user.get('email', '').lower()
public_email = user.get('public_email', '').lower()

if email.lower() in [user_email, public_email]:
    return user['id']
```

---

### Q3: 401 权限不足？

**原因**：令牌缺少 `read_user` 权限。

**解决**：重新创建令牌，选择以下权限：
```
☑ read_user
☑ read_api
```

---

### Q4: 用户不存在怎么办？

**处理**：
```python
user_id = manager.get_user_id_by_email(email)

if not user_id:
    # 方案 1：跳过
    print(f"跳过不存在的用户：{email}")
    
    # 方案 2：发送邮件邀请
    # manager.invite_user_by_email(group_id, email)
    
    # 方案 3：记录日志
    logging.warning(f"用户不存在：{email}")
```

---

## 📊 权限级别参考

| access_level | 权限级别 | 适用场景 |
|--------------|----------|----------|
| 10 | Guest | 临时访客，只能查看 Issue/MR |
| 20 | Reporter | 测试人员、产品经理，可查看代码 |
| 30 | Developer | 开发人员，可推送代码 ✅ |
| 40 | Maintainer | 团队负责人，可管理成员 ✅ |
| 50 | Owner | Group 所有者 |

---

## 💡 最佳实践

### 1. 缓存用户 ID

```python
USER_CACHE = {}

def get_user_id_cached(email):
    if email in USER_CACHE:
        return USER_CACHE[email]
    
    user_id = get_user_id_by_email(email)
    if user_id:
        USER_CACHE[email] = user_id
    
    return user_id
```

### 2. 错误处理与重试

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session_with_retry():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

session = create_session_with_retry()
response = session.get(url, headers=headers)
```

### 3. 批量操作限流

```python
import time

def batch_add_users(users, group_id, delay=0.5):
    """批量添加用户，避免触发 API 限流"""
    for i, user in enumerate(users):
        if i > 0:
            time.sleep(delay)  # 每次请求间隔 0.5 秒
        
        manager.add_member_by_email(
            group_id=group_id,
            email=user['email'],
            access_level=user['access_level']
        )
```

---

## 📋 相关接口文档

| 接口 | 路径 | 说明 |
|------|------|------|
| 搜索用户 | `GET /api/v4/users?search=xxx` | 通过邮箱/用户名搜索 |
| 获取用户详情 | `GET /api/v4/users/:id` | 获取单个用户信息 |
| 添加成员到 Group | `POST /api/v4/groups/:id/members` | 添加用户到 Group |
| 添加成员到 Project | `POST /api/v4/projects/:id/members` | 添加用户到 Project |
| 列出 Group 成员 | `GET /api/v4/groups/:id/members` | 查看 Group 成员列表 |

---

## 📞 技术支持

如有疑问，请参考：
- GitLab 官方文档：https://docs.gitlab.com/ee/api/users.html
- Members API 文档：https://docs.gitlab.com/ee/api/members.html
