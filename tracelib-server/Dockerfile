# Use lighter weight runner
FROM node:22-alpine AS runner

# Add dumb-init for better signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app .

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
CMD ["dumb-init", "npm", "start"]