// Campus Knowledge Graph Service
// Traverses entities and relationships in SQLite to support relational queries.

export class KGService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Get single entity and its immediate relations
  async getEntityRelations(name) {
    const entity = await this.prisma.entity.findFirst({
      where: {
        name: {
          contains: name
        }
      }
    });

    if (!entity) return null;

    // Find outgoing relations
    const outgoing = await this.prisma.relation.findMany({
      where: { sourceId: entity.id }
    });

    // Find incoming relations
    const incoming = await this.prisma.relation.findMany({
      where: { targetId: entity.id }
    });

    // Hydrate targets and sources
    const outgoingResolved = await Promise.all(outgoing.map(async rel => {
      const target = await this.prisma.entity.findUnique({ where: { id: rel.targetId } });
      return {
        relation: rel.type,
        targetName: target?.name,
        targetType: target?.type
      };
    }));

    const incomingResolved = await Promise.all(incoming.map(async rel => {
      const source = await this.prisma.entity.findUnique({ where: { id: rel.sourceId } });
      return {
        relation: rel.type,
        sourceName: source?.name,
        sourceType: source?.type
      };
    }));

    return {
      entity: {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        description: entity.description
      },
      outgoing: outgoingResolved,
      incoming: incomingResolved
    };
  }

  // Multi-hop search to trace paths between two entities
  async findPath(sourceName, targetName) {
    const sourceNode = await this.prisma.entity.findFirst({ where: { name: { contains: sourceName } } });
    const targetNode = await this.prisma.entity.findFirst({ where: { name: { contains: targetName } } });

    if (!sourceNode || !targetNode) return [];

    // Let's do a simple 2-hop search in database
    // Find relations connected to source
    const sourceRel = await this.prisma.relation.findMany({
      where: {
        OR: [
          { sourceId: sourceNode.id },
          { targetId: sourceNode.id }
        ]
      }
    });

    const targetRel = await this.prisma.relation.findMany({
      where: {
        OR: [
          { sourceId: targetNode.id },
          { targetId: targetNode.id }
        ]
      }
    });

    // Find common entity in 2-hop
    const sourceNeighbors = new Set(sourceRel.map(r => r.sourceId === sourceNode.id ? r.targetId : r.sourceId));
    const targetNeighbors = new Set(targetRel.map(r => r.sourceId === targetNode.id ? r.targetId : r.sourceId));

    const intersection = [...sourceNeighbors].filter(x => targetNeighbors.has(x));

    const path = [];
    if (intersection.length > 0) {
      const commonId = intersection[0];
      const commonNode = await this.prisma.entity.findUnique({ where: { id: commonId } });
      
      path.push(sourceNode.name);
      if (commonNode) path.push(commonNode.name);
      path.push(targetNode.name);
    }

    return path;
  }

  // Get full Knowledge Graph for Frontend visualization
  async getFullGraph() {
    const nodes = await this.prisma.entity.findMany();
    const links = await this.prisma.relation.findMany();

    return {
      nodes: nodes.map(n => ({ id: n.id, label: n.name, type: n.type })),
      links: links.map(l => ({ source: l.sourceId, target: l.targetId, label: l.type }))
    };
  }
}
