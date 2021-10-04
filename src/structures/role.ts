import type { Client } from '../client/mod.ts'
import { SnowflakeBase } from './base.ts'
import type { RoleModifyPayload, RolePayload } from '../types/role.ts'
import { Permissions } from '../utils/permissions.ts'
import type { Guild } from './guild.ts'
import type { Member } from './member.ts'
import { User } from './user.ts'

/** Represents a Guild Role */
export class Role extends SnowflakeBase {
  id: string
  guild: Guild
  name!: string
  color!: number
  hoist!: boolean
  position!: number
  permissions!: Permissions
  managed!: boolean
  mentionable!: boolean
  tags?: RoleTags

  constructor(client: Client, data: RolePayload, guild: Guild) {
    super(client, data)
    this.id = data.id
    this.guild = guild
    this.readFromData(data)
  }

  readFromData(data: RolePayload): void {
    this.name = data.name ?? this.name
    this.color = data.color ?? this.color
    this.hoist = data.hoist ?? this.hoist
    this.position = data.position ?? this.position
    this.permissions =
      data.permissions !== undefined
        ? new Permissions(data.permissions)
        : this.permissions
    this.managed = data.managed ?? this.managed
    this.mentionable = data.mentionable ?? this.mentionable
    this.tags =
      data.tags !== undefined
        ? {
            botID: data.tags?.bot_id,
            integrationID: data.tags?.integration_id,
            premiumSubscriber: 'premium_subscriber' in (data.tags ?? {})
          }
        : undefined
  }

  /** Delete the Role */
  async delete(): Promise<Role | undefined> {
    return this.guild.roles.delete(this)
  }

  /** Edit the Role */
  async edit(options: RoleModifyPayload): Promise<Role> {
    return this.guild.roles.edit(this, options)
  }

  /** Add the Role to a Member */
  async addTo(member: Member | User | string): Promise<boolean> {
    if (member instanceof User) {
      member = member.id
    }
    if (typeof member === 'string') {
      const tempMember = await this.guild.members.get(member)
      if (tempMember === undefined) {
        throw new Error(`Couldn't find the member ${member}.`)
      } else {
        member = tempMember
      }
    }

    return member.roles.add(this.id)
  }

  /** Remove the Role from a Member */
  async removeFrom(member: Member | User | string): Promise<boolean> {
    if (member instanceof User) {
      member = member.id
    }
    if (typeof member === 'string') {
      const tempMember = await this.guild.members.get(member)
      if (tempMember === undefined) {
        throw new Error(`Couldn't find the member ${member}.`)
      } else {
        member = tempMember
      }
    }

    return member.roles.remove(this.id)
  }
}

export interface RoleTags {
  /** The id of the bot who has this role */
  botID?: string
  /** Whether this is the premium subscriber role for this guild */
  premiumSubscriber: boolean
  /** The id of the integration this role belongs to */
  integrationID?: string
}
