import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';
import { UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<SkillEntity[]> {
    return this.skillRepository.find({
      where: { workspaceId, deletedAt: IsNull() },
      order: { label: 'ASC' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<SkillEntity | null> {
    return this.skillRepository.findOne({
      where: { id, workspaceId, deletedAt: IsNull() },
    });
  }

  async findByName(
    name: string,
    workspaceId: string,
  ): Promise<SkillEntity | null> {
    return this.skillRepository.findOne({
      where: { name, workspaceId, deletedAt: IsNull() },
    });
  }

  async create(
    input: CreateSkillInput,
    workspaceId: string,
  ): Promise<SkillEntity> {
    const existingSkill = await this.findByName(input.name, workspaceId);

    if (existingSkill) {
      throw new SkillException(
        `Skill with name "${input.name}" already exists`,
        SkillExceptionCode.SKILL_ALREADY_EXISTS,
      );
    }

    const skill = this.skillRepository.create({
      id: v4(),
      ...input,
      workspaceId,
      isCustom: true,
    });

    return this.skillRepository.save(skill);
  }

  async update(
    input: UpdateSkillInput,
    workspaceId: string,
  ): Promise<SkillEntity> {
    const skill = await this.findById(input.id, workspaceId);

    if (!skill) {
      throw new SkillException(
        'Skill not found',
        SkillExceptionCode.SKILL_NOT_FOUND,
      );
    }

    if (!skill.isCustom) {
      throw new SkillException(
        'Cannot update standard skill',
        SkillExceptionCode.SKILL_IS_STANDARD,
      );
    }

    const { id: _id, ...updates } = input;

    Object.assign(skill, updates);

    return this.skillRepository.save(skill);
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const skill = await this.findById(id, workspaceId);

    if (!skill) {
      throw new SkillException(
        'Skill not found',
        SkillExceptionCode.SKILL_NOT_FOUND,
      );
    }

    if (!skill.isCustom) {
      throw new SkillException(
        'Cannot delete standard skill',
        SkillExceptionCode.SKILL_IS_STANDARD,
      );
    }

    await this.skillRepository.softDelete({ id, workspaceId });
  }
}
