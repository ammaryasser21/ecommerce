
import {
    CreateOptions,
    DeleteResult,
    QueryFilter,
    Model,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateResult,
} from 'mongoose';
import { SaveOptions, HydratedDocument } from 'mongoose';

export abstract class BaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    // CREATE
    create(
        data: Partial<T>,
        options?: CreateOptions,
    ): Promise<HydratedDocument<T>>;

    create(
        data: Partial<T>[],
        options?: CreateOptions,
    ): Promise<HydratedDocument<T>[]>;

    // CREATE (One or Many)
    create(
        data: Partial<T>,
        options?: CreateOptions,
    ): Promise<HydratedDocument<T>>;
    create(
        data: Partial<T>[],
        options?: CreateOptions,
    ): Promise<HydratedDocument<T>[]>;
    async create(
        data: Partial<T> | Partial<T>[],
        options?: CreateOptions,
    ): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
        const isArray = Array.isArray(data);
        const docs = isArray ? data : [data];

        const created = await this.model.create(docs as never[], options);

        return (isArray ? created : created[0]) as
            | HydratedDocument<T>
            | HydratedDocument<T>[];
    }
    // FIND ONE
    findOne(
        filter: QueryFilter<T>,
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>,
    ) {
        return this.model.findOne(filter, projection, options).exec();
    }

    // FIND
    find(
        filter: QueryFilter<T> = {},
        projection?: ProjectionType<T>,
        options?: QueryOptions<T>,
    ) {
        return this.model.find(filter, projection, options).exec();
    }

    // FIND BY ID
    findById(id: string, projection?: ProjectionType<T>) {
        return this.model.findById(id, projection).exec();
    }

    // UPDATE ONE
    updateOne(
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
    ): Promise<UpdateResult> {
        return this.model.updateOne(filter, update).exec();
    }

    // UPDATE MANY
    updateMany(
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
    ): Promise<UpdateResult> {
        return this.model.updateMany(filter, update).exec();
    }

    // FIND ONE AND UPDATE
    findOneAndUpdate(
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: QueryOptions<T>,
    ) {
        return this.model
            .findOneAndUpdate(filter, update, {
                ...options,
                new: true,
            })
            .exec();
    }

    // DELETE ONE
    deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
        return this.model.deleteOne(filter).exec();
    }

    // DELETE MANY
    deleteMany(filter: QueryFilter<T>): Promise<DeleteResult> {
        return this.model.deleteMany(filter).exec();
    }

    // COUNT
    count(filter: QueryFilter<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    // PAGINATION
    async paginate({
        filter = {} as QueryFilter<T>,
        page = 1,
        limit = 10,
    }: {
        filter?: QueryFilter<T>;
        page?: number;
        limit?: number;
    }) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        return {
            data,
            total,
            currentPage: page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
