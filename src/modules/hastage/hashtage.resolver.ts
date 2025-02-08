import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Hashtag } from './entity/hastage.entity'
import { HashtagService } from './hastage.service'
import {
  PostHastageResponse,
  PostHastagesResponse,
} from './dtos/HashtagPostOutput.dto '
import {
  CommentHastageResponse,
  CommentHastagesResponse,
} from './dtos/HashtagCommentOutput.dto  '
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import {
  ReplyHastageResponse,
  ReplyHastagesResponse,
} from './dtos/HashtagReplyOutput.dto   '

@Resolver(() => Hashtag)
export class HashtagResolver {
  constructor (private readonly hashtagService: HashtagService) {}

  //   -------------------- Post ----------------------

  @Mutation(() => PostHastageResponse)
  @Auth(Role.USER)
  async createHashtagPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId') postId: number,
    @Args('content') content: string,
  ): Promise<PostHastageResponse> {
    const data = await this.hashtagService.createHastagePost(
      user.id,
      postId,
      content,
    )
    return { data }
  }

  @Query(() => PostHastageResponse)
  @Auth(Role.USER)
  async findPostByHashtag (
    @Args('content') content: string,
  ): Promise<PostHastageResponse> {
    return { data: await this.hashtagService.findPostHashtag(content) }
  }

  // @Query(() => PostHastagesResponse)
  // @Auth(Role.USER)
  // async findAllPostHashtags (
  //   @Args('postId') postId: number,
  //   @Args('limit', { defaultValue: 10 }) limit: number,
  //   @Args('skip', { defaultValue: 0 }) skip: number,
  // ): Promise<PostHastagesResponse> {
  //   return {
  //     data: await this.hashtagService.findAllPostHashtag(postId, limit, skip),
  //   }
  // }

  @Mutation(() => PostHastageResponse)
  @Auth(Role.USER)
  async updateHashtagPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: number,
    @Args('postId') postId: number,
    @Args('content') content: string,
  ): Promise<PostHastageResponse> {
    return {
      data: await this.hashtagService.updateHastagePost(
        user.id,
        id,
        postId,
        content,
      ),
    }
  }

  @Query(() => PostHastagesResponse)
  @Auth(Role.USER)
  async findAllUserHashtagOnPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<PostHastagesResponse> {
    const items = await this.hashtagService.findAllUserHashtagOnPost(
      user.id,
      limit,
      skip,
    )

    const totalCount = await this.hashtagService.findAllUserHashtagOnPostCount(
      user.id,
    )

    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  // ------------------ Comment---------------

  @Mutation(() => CommentHastageResponse)
  @Auth(Role.USER)
  async createHashtagComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId') commentId: number,
    @Args('content') content: string,
  ): Promise<CommentHastageResponse> {
    return {
      data: await this.hashtagService.createHastageComment(
        user.id,
        commentId,
        content,
      ),
    }
  }

  @Query(() => CommentHastageResponse)
  @Auth(Role.USER)
  async findCommentByHashtag (
    @Args('content') content: string,
  ): Promise<CommentHastageResponse> {
    return { data: await this.hashtagService.findCommentHashtag(content) }
  }

  @Query(() => CommentHastagesResponse)
  @Auth(Role.USER)
  async findAllCommentHashtags (
    @Args('commentId') commentId: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<CommentHastagesResponse> {
    const items = await this.hashtagService.findAllCommentHashtag(
      commentId,
      limit,
      skip,
    )
    const totalCount = await this.hashtagService.findAllCommentHashtagCount(
      commentId,
    )
    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  @Query(() => CommentHastagesResponse)
  @Auth(Role.USER)
  async findAllUserHashtagsOnComments (
    @CurrentUser() user: CurrentUserDto,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('skip', { defaultValue: 0 }) skip: number,
  ): Promise<CommentHastagesResponse> {
    const items = await this.hashtagService.findAllUserHashtagOnComment(
      user.id,
      limit,
      skip,
    )

    const totalCount =
      await this.hashtagService.findAllUserHashtagOnCommentCount(user.id)

    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  @Mutation(() => CommentHastageResponse)
  @Auth(Role.USER)
  async updateHashtagComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: number,
    @Args('commentId') commentId: number,
    @Args('content') content: string,
  ): Promise<CommentHastageResponse> {
    return {
      data: await this.hashtagService.updateHastageComment(
        user.id,
        id,
        commentId,
        content,
      ),
    }
  }

  // ---------------Reply--------------

  @Mutation(() => ReplyHastageResponse)
  @Auth(Role.USER)
  async createHashtagReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('replyId', { type: () => Int }) replyId: number,
    @Args('content') content: string,
  ): Promise<ReplyHastageResponse> {
    return {
      data: await this.hashtagService.createHastageReply(
        user.id,
        replyId,
        content,
      ),
    }
  }

  @Query(() => ReplyHastageResponse, { nullable: true })
  @Auth(Role.USER)
  async findReplyHashtag (
    @Args('content') content: string,
  ): Promise<ReplyHastageResponse> {
    return { data: await this.hashtagService.findReplyHashtag(content) }
  }

  @Query(() => ReplyHastagesResponse)
  @Auth(Role.USER)
  async findAllReplyHashtags (
    @Args('replyId', { type: () => Int }) replyId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
    @Args('skip', { type: () => Int, nullable: true }) skip = 0,
  ): Promise<ReplyHastagesResponse> {
    const items = await this.hashtagService.findAllReplyHashtag(
      replyId,
      limit,
      skip,
    )
    const totalCount = await this.hashtagService.findAllReplyHashtagCount(
      replyId,
    )
    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  @Query(() => ReplyHastagesResponse)
  @Auth(Role.USER)
  async findAllUserHashtagOnReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
    @Args('skip', { type: () => Int, nullable: true }) skip = 0,
  ): Promise<ReplyHastagesResponse> {
    const items = await this.hashtagService.findAllUserHashtagOnReply(
      user.id,
      limit,
      skip,
    )

    const totalCount = await this.hashtagService.findAllUserHashtagOnReplyCount(
      user.id,
    )
    return {
      items,
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  @Mutation(() => ReplyHastageResponse)
  @Auth(Role.USER)
  async updateHashtagReply (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
    @Args('replyId', { type: () => Int }) replyId: number,
    @Args('content') content: string,
  ): Promise<ReplyHastageResponse> {
    return {
      data: await this.hashtagService.updateHastageReply(
        user.id,
        id,
        replyId,
        content,
      ),
    }
  }

  // ------------- Global-------------

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteHashtag (
    @Args('id', { type: () => Int }) id: number,
  ): Promise<string> {
    return this.hashtagService.deleteHastage(id)
  }
}
