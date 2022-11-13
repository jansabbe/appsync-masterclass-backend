import { faker } from "@faker-js/faker";
import { getAccount, aNewUser } from "@common/test-utils";

it("saves accounts in database after signup in cognito", async () => {
  const username = faker.internet.userName();

  const newUser = aNewUser({ username });
  const userId = await newUser.signsUp();
  await newUser.confirms(userId);

  await expect(getAccount(userId)).resolves.toEqual({
    pk: userId,
    username: username,
    acct: username,
    createdAt: expect.any(String),
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
  });
});
