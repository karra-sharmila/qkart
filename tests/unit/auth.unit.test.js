const { userOne } = require("../fixtures/user.fixture");
const { authService, userService } = require("../../src/services");
const ApiError = require("../../src/utils/ApiError");
const mockingoose = require("mockingoose").default;

describe("Auth test", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe("Login", () => {
    it("should return user object if all ok", async () => {
      userOne.isPasswordMatch = () => {
        return true;
      };

      const getUserByEmailMock = jest.fn();
      userService.getUserByEmail = getUserByEmailMock.mockReturnValue(userOne);

      let authResponse = await authService.loginUserWithEmailAndPassword(
        userOne.email,
        "password1"
      );

      expect(getUserByEmailMock).toHaveBeenCalled();
      expect(JSON.stringify(authResponse)).toEqual(JSON.stringify(userOne));
    });

    it("should return API error when password mismatch", async () => {
      userOne.isPasswordMatch = () => {
        return false;
      };

      userService.getUserByEmail = jest.fn().mockReturnValue(userOne);

      expect(
        authService.loginUserWithEmailAndPassword(userOne.email, "password1")
      ).rejects.toThrow(ApiError);
    });

    it("should return API error when user doesnt exist", async () => {
      userOne.isPasswordMatch = () => {
        return true;
      };

      userService.getUserByEmail = jest.fn().mockReturnValue(null);

      expect(
        authService.loginUserWithEmailAndPassword(userOne.email, "password1")
      ).rejects.toThrow(ApiError);
    });
  });
});
