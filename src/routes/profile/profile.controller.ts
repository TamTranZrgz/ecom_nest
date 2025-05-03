import { Body, Controller, Get, Put } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import { ActiveUser } from 'src/shared/decorator/active-user.decorator'
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from './profile.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put()
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.updateProfile({
      body,
      userId,
    })
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword({
      body,
      userId,
    })
  }
}
