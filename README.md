# 🎬 CineBooth

**Your seat next to the director.**

An open-source, self-hostable and federation-ready social watch party platform. Watch videos together, connect with friends, discover movies, and share your cinematic experiences — all in one place.

> [!IMPORTANT]
> **CineBooth is in early development.** Most features described below are planned and are not yet available. The project is not ready for production use.

## ✨ Vision

Watching a movie is better together.

CineBooth aims to bring the social experience of a movie theater to your browser, allowing friends to create private watch parties, synchronize playback, communicate through voice and video, and discover new movies based on their shared interests.

CineBooth is built around a few core principles:

- **Free and open source:** No subscriptions, premium tiers, or paywalls.
- **Privacy first:** No advertising trackers or unnecessary data collection.
- **Self-hostable:** Run your own CineBooth instance.
- **Federation-ready:** Designed for future interoperability between independent instances.
- **Respect for copyright:** No DRM circumvention or unauthorized streaming integrations.
- **Community-driven:** Contributions, feedback, and voluntary donations are welcome.

## 🚀 Planned Features

### 🎥 Private Watch Parties

Create private rooms and invite friends using secure invitation links or access codes.

Planned capabilities include:

- Host and participant roles
- Room access controls and invitation management
- Synchronized playback, pause, and seeking
- Real-time text chat
- Voice calls and group video calls
- Playback synchronization and latency compensation

CineBooth will not provide publicly discoverable rooms.

### 📁 Local Video Playback

CineBooth is designed to support two playback modes:

**Local Sync**

Each participant selects a locally stored video file. CineBooth synchronizes playback without uploading the video to the server.

**Host Streaming**

A room host can stream a video to authorized participants, provided they have the necessary rights to share that content.

Initial development will focus on MP4 playback, with additional formats and codec compatibility considered later.

### 🔗 External Streaming Platforms

CineBooth will allow users to share links to movies hosted on third-party streaming platforms.

Services such as Netflix, Prime Video, and Disney+ will open through their official websites.

CineBooth will not extract protected video streams, bypass DRM, or redistribute third-party copyrighted content.

Official embedded-player integrations, such as YouTube, may be supported where permitted by the relevant platform's policies.

### 🍿 Movie Discovery

Explore movie information through appropriately licensed metadata providers.

Planned features include:

- Movie descriptions and release information
- Cast and crew
- Genres and related movies
- Posters and artwork
- Community-contributed trivia
- Ratings and reviews
- Personal watchlists

Metadata availability will depend on provider permissions and licensing conditions.

### ⭐ Reviews and Recommendations

Rate movies, write reviews, and discover new titles.

CineBooth aims to provide an open-source recommendation engine based on user preferences, ratings, watch history, and other appropriately authorized data.

Future features may include group recommendations to help everyone in a watch party agree on what to watch next.

### 🌐 Federation

CineBooth is being designed with future federation in mind.

The long-term goal is to allow users on independently hosted instances to interact without relying on a single centralized service.

Federation will be introduced incrementally, with particular attention to authentication, privacy, security, and private-room access controls.

## 🛠️ Technology Stack

| Component               | Technology                   |
| ----------------------- | ---------------------------- |
| Frontend                | Next.js, React, Tailwind CSS |
| Backend                 | Node.js, Express, TypeScript |
| Database                | PostgreSQL                   |
| ORM                     | Prisma (planned)             |
| Cache                   | Redis                        |
| Real-time communication | Socket.IO (planned)          |
| Voice and video         | WebRTC, LiveKit (planned)    |
| Validation              | Zod                          |
| Infrastructure          | Docker Compose               |

The architecture may evolve as development progresses.

## 📦 Project Structure

```text
cinebooth/
├── apps/
│   ├── api/                 # Express backend
│   └── web/                 # Planned Next.js frontend
├── packages/
│   ├── shared/              # Shared types and utilities
│   └── database/            # Database models and migrations
├── infra/
│   └── docker/              # Infrastructure configuration
├── docs/
│   └── architecture/        # Architecture documentation
├── compose.yaml
├── package.json
├── .env.example
└── LICENSE
```

## 💻 Getting Started

### Prerequisites

- Node.js 22 or newer
- npm
- Docker Engine with Docker Compose
- Git

### Clone the Repository

```bash
git clone https://github.com/fenixthebuilder/cinebooth.git
cd cinebooth
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure the required environment variables, including a secure PostgreSQL password.

Never commit your `.env` file.

### Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis for local development.

### Start the API

```bash
npm run dev:api
```

The development API will be available at:

`http://localhost:4000`

### Verify the API

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "cinebooth-api",
  "version": "0.1.0",
  "timestamp": "..."
}
```

The timestamp is generated dynamically.

**Note:** The API currently provides an initial health endpoint. Authentication, rooms, video synchronization, and other application features are not yet implemented.

## 🗺️ Development Roadmap

- [x] Initialize monorepo
- [x] Set up Express and TypeScript
- [x] Implement initial API health endpoint
- [x] Add Docker Compose configuration
- [ ] Set up Prisma and database migrations
- [ ] Implement authentication and session management
- [ ] Implement private rooms and secure invitations
- [ ] Implement WebSocket-based playback synchronization
- [ ] Add local MP4 playback
- [ ] Develop the frontend
- [ ] Integrate voice and video communication
- [ ] Add movie metadata and discovery
- [ ] Implement ratings, reviews, and watchlists
- [ ] Develop the recommendation engine
- [ ] Explore authorized host-streaming capabilities
- [ ] Introduce federation support

## ⚖️ Copyright and Content Responsibility

CineBooth is a general-purpose software platform and does not provide unauthorized copies of copyrighted movies or television shows.

Users are responsible for ensuring that they have the necessary rights and permissions to access, reproduce, transmit, or share content through CineBooth.

CineBooth does not provide DRM circumvention mechanisms.

Operators of publicly accessible CineBooth instances must comply with applicable laws and obligations, including those concerning copyright, privacy, and the handling of unlawful content reports.

## 🤝 Contributing

Contributions are welcome!

Whether you are a developer, designer, translator, tester, or movie enthusiast, your help can make CineBooth better.

You can contribute by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Submitting pull requests
- Helping with translations
- Reviewing security and accessibility

Contribution guidelines will be published as development progresses.

## ❤️ Support the Project

CineBooth is free and open source.

There are no subscriptions, premium features, or paid memberships.

If you enjoy the project and would like to support its development and infrastructure costs, voluntary donations may be made available in the future.

Donations will never be required to access CineBooth's features.

## 📜 License

CineBooth is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-only)**.

See the [LICENSE](LICENSE) file for the complete license text.

---

**CineBooth — Your seat next to the director.** 🎬

_Built for movie lovers, by movie lovers._
