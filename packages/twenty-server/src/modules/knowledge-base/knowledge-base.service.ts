import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { KBArticleEntity, KBCategoryEntity, ArticleStatus } from './knowledge-base.entity';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KBArticleEntity)
    private readonly articleRepo: Repository<KBArticleEntity>,
    @InjectRepository(KBCategoryEntity)
    private readonly categoryRepo: Repository<KBCategoryEntity>,
  ) {}

  async createCategory(
    workspaceId: string,
    name: string,
    parentCategoryId?: string,
  ): Promise<KBCategoryEntity> {
    return this.categoryRepo.save(this.categoryRepo.create({ workspaceId, name, parentCategoryId }));
  }

  async getCategories(workspaceId: string): Promise<KBCategoryEntity[]> {
    return this.categoryRepo.find({ where: { workspaceId }, order: { sortOrder: 'ASC' } });
  }

  async createArticle(
    workspaceId: string,
    data: { title: string; content: string; categoryId?: string; authorId?: string; tags?: string[] },
  ): Promise<KBArticleEntity> {
    return this.articleRepo.save(this.articleRepo.create({ workspaceId, ...data }));
  }

  async publishArticle(articleId: string): Promise<KBArticleEntity> {
    const article = await this.articleRepo.findOne({ where: { id: articleId } });
    if (!article) throw new NotFoundException(`Article ${articleId} not found`);
    article.status = ArticleStatus.PUBLISHED;
    return this.articleRepo.save(article);
  }

  async searchArticles(workspaceId: string, query: string): Promise<KBArticleEntity[]> {
    return this.articleRepo.find({
      where: [
        { workspaceId, status: ArticleStatus.PUBLISHED, title: ILike(`%${query}%`) },
        { workspaceId, status: ArticleStatus.PUBLISHED, content: ILike(`%${query}%`) },
      ],
      order: { viewCount: 'DESC' },
      take: 20,
    });
  }

  async suggestForTicket(workspaceId: string, ticketSubject: string): Promise<KBArticleEntity[]> {
    const keywords = ticketSubject.split(/\s+/).filter((w) => w.length > 3).slice(0, 5);
    if (!keywords.length) return [];
    const results: KBArticleEntity[] = [];
    for (const keyword of keywords) {
      const found = await this.searchArticles(workspaceId, keyword);
      for (const article of found) {
        if (!results.some((r) => r.id === article.id)) results.push(article);
      }
    }
    return results.slice(0, 5);
  }

  async recordView(articleId: string): Promise<void> {
    await this.articleRepo.increment({ id: articleId }, 'viewCount', 1);
  }

  async recordFeedback(articleId: string, helpful: boolean): Promise<void> {
    if (helpful) {
      await this.articleRepo.increment({ id: articleId }, 'helpfulCount', 1);
    } else {
      await this.articleRepo.increment({ id: articleId }, 'notHelpfulCount', 1);
    }
  }

  async getDeflectionRate(workspaceId: string): Promise<number> {
    const total = await this.articleRepo.sum('viewCount', { workspaceId }) ?? 0;
    const helpful = await this.articleRepo.sum('helpfulCount', { workspaceId }) ?? 0;
    return total ? Math.round((helpful / total) * 100) : 0;
  }
}
