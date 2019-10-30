import {Entity, PrimaryColumn, Column, Index, BaseEntity} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    telegramId: number;

    @Index()
    @Column()
    telegramHandle: string;

    @Column()
    telegramChatId: number;

    @Index()
    @Column({ type: 'varchar', length: 13, nullable: true })
    eosAccount: string

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;
}
